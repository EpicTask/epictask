"""Service-to-service endpoints. Not reachable with a user's ID token.

Settlement is the point where a reward stops being a promise and becomes money
the child actually has. It is driven by the Xumm webhook in xrpl_management,
which fires when the parent signs.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from ...config.internal_auth import verify_internal_caller
from ...domain.reward_models import RewardState
from ...services.rewards import reward_service
from ...storage import firestore_db as task_db

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
