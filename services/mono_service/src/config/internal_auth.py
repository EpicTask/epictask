"""Shared-secret authentication for service-to-service calls.

Mirrors the mechanism already in the narrative engine
(`adaptive_narrative_engine/src/routes/internal.py`) rather than introducing a
second kind of internal auth, so there is one thing to rotate and one thing to
reason about.

A stronger option exists and is worth taking later: Cloud Run IAM with an OIDC
ID token minted by the calling service's account. That removes the shared secret
entirely and gives per-caller identity. It is deliberately not used here yet
because it cannot be exercised outside GCP, and an untestable auth check on a
money path is its own risk. If you move to it, verify the token audience and
service-account email, and keep this check as a fallback only during migration.
"""
import hmac
import os

from fastapi import HTTPException, Request, status

INTERNAL_TOKEN_HEADER = "X-Internal-Token"
_ENV_VAR = "INTERNAL_SERVICE_TOKEN"
_PUSH_SA_VAR = "PUBSUB_PUSH_SERVICE_ACCOUNT"
_PUSH_AUDIENCE_VAR = "PUBSUB_PUSH_AUDIENCE"


def verify_internal_caller(request: Request) -> None:
    """Reject any call not carrying the shared internal token.

    Fails closed when the token is not configured: an unset secret must not
    silently turn an internal endpoint into an open one. The previous
    service-to-service endpoint (`/api/xrpl/log`) had no check at all.
    """
    expected = os.getenv(_ENV_VAR, "").strip()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Internal auth not configured",
        )

    provided = request.headers.get(INTERNAL_TOKEN_HEADER, "")
    # Constant-time compare so a wrong token cannot be recovered by timing.
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: invalid internal token",
        )


def verify_pubsub_push_caller(request: Request) -> None:
    """Authenticate a Cloud Pub/Sub push delivery.

    Pub/Sub push **cannot send arbitrary headers**, so it can never satisfy
    `verify_internal_caller`. It offers exactly two ways to authenticate:

    1. `--push-auth-service-account`, which makes Pub/Sub mint a Google-signed
       OIDC token and send it as `Authorization: Bearer ...`. This is used here.
    2. A secret embedded in the push endpoint's query string — rejected,
       because the URL lands in Cloud Run request logs. That is the same leak
       that was just removed from the Xumm webhook handler.

    Mode is chosen by configuration and each mode fails closed:

    * `PUBSUB_PUSH_SERVICE_ACCOUNT` set  -> a valid OIDC token from exactly that
      service account is required.
    * unset -> falls back to the shared internal token, which is what local
      development and the test suite use.

    Deliberately not "accept either": a deployment that sets the service
    account should stop honouring the shared secret on this route.
    """
    expected_sa = os.getenv(_PUSH_SA_VAR, "").strip()

    if not expected_sa:
        # No push identity configured — treat this as a non-Pub/Sub caller.
        verify_internal_caller(request)
        return

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: missing OIDC token",
        )

    token = auth_header.split(" ", 1)[1].strip()

    try:
        from google.auth.transport import requests as ga_requests
        from google.oauth2 import id_token as google_id_token

        audience = os.getenv(_PUSH_AUDIENCE_VAR, "").strip() or None
        claims = google_id_token.verify_oauth2_token(
            token, ga_requests.Request(), audience
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: invalid OIDC token",
        ) from e

    if claims.get("email") != expected_sa or not claims.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: OIDC token is not from the expected service account",
        )
