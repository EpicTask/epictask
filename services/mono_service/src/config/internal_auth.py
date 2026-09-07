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
