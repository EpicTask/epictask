"""Service-to-service endpoints. Not reachable with a user's ID token.

Settlement is the point where a reward stops being a promise and becomes money
the child actually has. It is driven by the Xumm webhook in xrpl_management,
which fires when the parent signs.
"""
import base64
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from ...config.collection_names import collections
from ...config.firebase_config import db
from ...config.internal_auth import verify_internal_caller, verify_pubsub_push_caller
from ...domain.reward_models import RewardState
from ...services.rewards import reward_service
from ...storage import firestore_db as task_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/internal", tags=["internal"])


class SettlementNotice(BaseModel):
    """A signed, submitted payment for one task.

    Only `task_id` is required: the assignees, amount and currency are read
    from the task document, so the caller never has to be trusted about how
    much a child earned.
    """

    task_id: str
    tx_hash: str | None = None
    payload_uuid: str | None = None


@router.post("/settlement")
async def record_settlement(
    notice: SettlementNotice,
    request: Request,
    _: None = Depends(verify_internal_caller),
):
    """Promote a task's pending reward credit to settled.

    Idempotent: the settled event has a deterministic ID, so a retried or
    duplicated webhook produces `duplicate` rather than a second credit.
    """
    task = task_db.get_task(notice.task_id)
    if not task or not isinstance(task, dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"task {notice.task_id} not found",
        )

    result = reward_service.credit_task(
        task, state=RewardState.SETTLED, tx_hash=notice.tx_hash
    )
    return {"success": True, "task_id": notice.task_id, "credited": result}


@router.post("/pubsub/narrative-payout-confirmed")
async def handle_narrative_payout_confirmed(
    request: Request,
    _: None = Depends(verify_pubsub_push_caller),
):
    """Pub/Sub push subscriber for narrative.payout.confirmed.v1.

    The narrative engine has always published this topic and nothing has ever
    subscribed to it, so story earnings reached no balance: a child could
    finish a story, be paid on-chain, and see nothing in the app.

    The event payload is treated as a *pointer*, not as truth. Amount and
    currency are read from the stored payout record, exactly as the task path
    reads them from the task document.

    Returns 200 to ack. Raises 5xx to nack so Pub/Sub retries; crediting is
    idempotent, so a redelivery cannot double-count.

    Auth is OIDC, not the shared header token: Pub/Sub push cannot send custom
    headers, so `verify_internal_caller` can never be satisfied by a real
    delivery. See `verify_pubsub_push_caller`.

    GCP setup — see `resources/pubsub_subscription_setup.md` for the full
    runbook including the topic, the push service account, the IAM binding and
    the dead-letter topic. The subscription itself:

        gcloud pubsub subscriptions create narrative-payout-confirmed-sub \
          --topic=narrative.payout.confirmed.v1 \
          --push-endpoint=https://<mono-url>/api/internal/pubsub/narrative-payout-confirmed \
          --push-auth-service-account=pubsub-push@<project>.iam.gserviceaccount.com \
          --ack-deadline=60

    mono_service must also have PUBSUB_PUSH_SERVICE_ACCOUNT set to that same
    address, or the route falls back to expecting the shared token and every
    delivery is rejected.
    """
    envelope = await request.json()
    message = envelope.get("message") or {}
    if not message:
        return {"status": "ignored", "reason": "no message"}

    try:
        event = json.loads(base64.b64decode(message.get("data", "")).decode("utf-8"))
    except Exception as e:
        # Malformed messages are acked, not retried: redelivery cannot fix them
        # and a poison message would block the subscription indefinitely.
        logger.error("[pubsub] undecodable narrative payout event: %s", e)
        return {"status": "ignored", "reason": "malformed message"}

    request_id = event.get("request_id")
    if not request_id:
        logger.error("[pubsub] narrative payout event has no request_id")
        return {"status": "ignored", "reason": "no request_id"}

    snapshot = (
        db.collection(collections.NARRATIVE_PAYOUT_REQUESTS)
        .document(str(request_id))
        .get()
    )
    if not snapshot.exists:
        # Nack: the record may not have been committed yet when the event
        # arrived, and a retry is likely to succeed.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"payout record {request_id} not found yet",
        )

    payout = snapshot.to_dict() or {}
    payout.setdefault("request_id", request_id)

    if payout.get("status") != "confirmed":
        # Only a confirmed payout is money the child actually has.
        logger.info(
            "[pubsub] payout %s is %s, not confirmed; skipping credit",
            request_id,
            payout.get("status"),
        )
        return {"status": "ignored", "reason": "payout not confirmed"}

    credited = reward_service.credit_narrative_payout(
        payout, state=RewardState.SETTLED
    )
    return {"success": True, "request_id": request_id, "credited": credited}


# ---------------------------------------------------------------------------
# Scheduled jobs
#
# Driven by Cloud Scheduler with the internal token in a header, rather than by
# Cloud Functions — this project deliberately has no Functions infrastructure
# (see the reward pipeline notes in CLAUDE.md).
# ---------------------------------------------------------------------------

@router.post("/jobs/expire-pending")
async def run_expire_pending(
    request: Request,
    _: None = Depends(verify_internal_caller),
):
    """Void reward credits that have been pending past the expiry window.

    Idempotent: re-running voids nothing extra, because a void is itself an
    event at a deterministic ID.

    GCP setup (run once):
        gcloud scheduler jobs create http expire-pending-rewards \
          --schedule="0 3 * * *" \
          --uri=https://<mono-url>/api/internal/jobs/expire-pending \
          --http-method=POST \
          --headers="X-Internal-Token=<secret>"
    """
    return {"success": True, **reward_service.expire_pending()}


@router.post("/jobs/recompute-ranks")
async def run_recompute_ranks(
    request: Request,
    _: None = Depends(verify_internal_caller),
):
    """Refresh the stored global rank on every reward projection.

    Safe to run at any cadence: reads fall back to a live count for anyone this
    has not covered yet, so a missed run costs query time, never correctness.

    GCP setup (run once):
        gcloud scheduler jobs create http recompute-reward-ranks \
          --schedule="*/15 * * * *" \
          --uri=https://<mono-url>/api/internal/jobs/recompute-ranks \
          --http-method=POST \
          --headers="X-Internal-Token=<secret>"
    """
    return {"success": True, **reward_service.recompute_ranks()}
