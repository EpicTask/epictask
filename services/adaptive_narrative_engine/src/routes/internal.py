"""Internal routes for service-to-service and Pub/Sub push delivery."""
import base64
import json
import os
from fastapi import APIRouter, HTTPException, Request

from src.domain.models import PayoutRequestRecord
from src.services.payout_service import payout_service

router = APIRouter(prefix="/internal", tags=["internal"])

_INTERNAL_TOKEN = os.getenv("PUBSUB_INTERNAL_TOKEN", "")


def _verify_token(request: Request) -> None:
    """Reject calls that don't carry the shared internal token."""
    if not _INTERNAL_TOKEN:
        return  # token not configured — allow in local dev
    if request.headers.get("X-Internal-Token") != _INTERNAL_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/pubsub/payout_requested")
async def handle_payout_requested(request: Request):
    """
    Pub/Sub push subscriber for narrative.payout.requested.v1.

    Cloud Pub/Sub POSTs here when a payout is requested. Acts as a
    recovery path: if the synchronous process_payout call in payouts.py
    failed (timeout, restart), this handler retries it.

    Manual-approval payouts are skipped — the parent HTTP approval route
    handles those directly.

    Returns 200 to ack. Raises 5xx to nack and trigger a Pub/Sub retry.

    GCP setup (run once):
        gcloud pubsub subscriptions create narrative-payout-requested-sub \\
          --topic=narrative.payout.requested.v1 \\
          --push-endpoint=https://<ane-url>/internal/pubsub/payout_requested \\
          --push-auth-service-account=<sa>@<project>.iam.gserviceaccount.com \\
          --ack-deadline=60
    """
    _verify_token(request)

    envelope = await request.json()
    message = envelope.get("message", {})
    if not message:
        return {"status": "ignored", "reason": "no message"}

    try:
        data = base64.b64decode(message.get("data", "")).decode("utf-8")
        event = json.loads(data)
    except Exception as e:
        print(f"[pubsub] Failed to decode payout_requested message: {e}")
        return {"status": "ignored", "reason": "malformed message"}

    request_id = event.get("request_id")
    if not request_id:
        return {"status": "ignored", "reason": "missing request_id"}

    payout = await payout_service.get_payout_request(request_id)
    if not payout:
        return {"status": "ignored", "reason": "payout not found"}

    if payout.get("requires_manual_approval"):
        return {"status": "skipped", "reason": "awaiting parent approval"}

    if payout.get("status") != "pending":
        return {"status": "skipped", "reason": f"status is {payout.get('status')}"}

    try:
        payout_record = PayoutRequestRecord(**payout)
        await payout_service.process_payout(payout_record)
        return {"status": "processed", "request_id": request_id}
    except Exception as e:
        print(f"[pubsub] Failed to process payout {request_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
