from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from ...domain.task_models import (
    TaskCreated, TaskAssigned, TaskCancelled, TaskCommentAdded,
    TaskCompleted, TaskExpired, TaskRatingUpdate, TaskRewarded,
    TaskUpdated, TaskVerified
)
from ...services import task_service, leaderboard_service
from ...config.security import get_current_user, get_current_user_strict
from ...config.role_claims import sync_role_claim
from ...storage import user_db

router = APIRouter()


def _get_caller_role(current_user: dict) -> str:
    """
    Role from the ID token's custom claims, falling back to Firestore.

    The fallback covers users created before claims existed and the up-to-an-
    hour window before a freshly written claim reaches the client's token. It
    repairs the claim on the way through, so the read stops happening once the
    caller's token refreshes.
    """
    uid = current_user.get("uid")
    token_role = current_user.get("role")
    if token_role:
        return token_role
    if uid:
        profile = user_db.get_user_profile(uid)
        if profile and profile.get("role"):
            role = profile.get("role")
            sync_role_claim(uid, role)
            return role
    return "kid"


def _require_parent(current_user: dict) -> str:
    """Return caller UID if parent role, else raise 403."""
    role = _get_caller_role(current_user)
    if role not in ("parent", "admin"):
        raise HTTPException(status_code=403, detail="Parent role required")
    return current_user.get("uid")



def _require_self_or_guardian(target_uid: str, current_user: dict) -> str:
    """Allow the subject, their parent, or an admin. Otherwise 403.

    Reward data is per-child financial information. Without this check any
    signed-in user could read any family's earnings by putting someone else's
    ID in the path.
    """
    caller_uid = current_user.get("uid")
    if caller_uid == target_uid:
        return caller_uid
    if _get_caller_role(current_user) == "admin":
        return caller_uid

    profile = user_db.get_user_profile(caller_uid) or {}
    if target_uid in (profile.get("children") or []):
        return caller_uid

    raise HTTPException(status_code=403, detail="Access denied")


async def _require_task_owner(task_id: str, caller_uid: str) -> dict:
    """Fetch task and verify caller is the creator. Raises 404/403 as appropriate."""
    task = await task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.get("user_id") != caller_uid:
        raise HTTPException(status_code=403, detail="You don't own this task")
    return task


@router.post("/")
async def create_task(request: TaskCreated, current_user: dict = Depends(get_current_user)):
    """Create and store a new task."""
    caller_uid = _require_parent(current_user)
    if request.user_id != caller_uid:
        raise HTTPException(status_code=403, detail="user_id must match your account")
    return await task_service.create_task(request)


@router.post("/{task_id}/assign")
async def assign_task(task_id: str, request: TaskAssigned, current_user: dict = Depends(get_current_user)):
    """Assign a task to a user."""
    caller_uid = _require_parent(current_user)
    await _require_task_owner(request.task_id, caller_uid)
    response = await task_service.assign_task(request)
    return {"response": response}


@router.post("/{task_id}/cancel")
async def cancel_task(task_id: str, request: TaskCancelled, current_user: dict = Depends(get_current_user)):
    """Cancel a task."""
    caller_uid = _require_parent(current_user)
    await _require_task_owner(request.task_id, caller_uid)
    response = await task_service.cancel_task(request)
    return {"response": response}


@router.post("/{task_id}/comment")
async def add_comment(task_id: str, request: TaskCommentAdded, current_user: dict = Depends(get_current_user)):
    """Add a comment to a task."""
    caller_uid = current_user.get("uid")
    if request.user_id != caller_uid:
        raise HTTPException(status_code=403, detail="user_id must match your account")
    response = await task_service.add_comment(request)
    return {"response": response}


@router.post("/{task_id}/complete")
async def complete_task(task_id: str, request: TaskCompleted, current_user: dict = Depends(get_current_user)):
    """Mark a task as completed."""
    caller_uid = current_user.get("uid")
    if request.completed_by_id != caller_uid:
        raise HTTPException(status_code=403, detail="completed_by_id must match your account")
    if request.task_id != task_id:
        raise HTTPException(status_code=400, detail="task_id in payload does not match route task_id")
    task = await task_service.get_task(request.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if caller_uid not in (task.get("assigned_to_ids") or []):
        raise HTTPException(status_code=403, detail="You are not assigned to this task")
    response = await task_service.complete_task(request)
    return {"response": response}


@router.post("/{task_id}/expire")
async def expire_task(task_id: str, request: TaskExpired, current_user: dict = Depends(get_current_user)):
    """Mark a task as expired. Admin/system use only."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    response = await task_service.expire_task(request)
    return {"response": response}


@router.post("/{task_id}/rating")
async def update_rating(task_id: str, request: TaskRatingUpdate, current_user: dict = Depends(get_current_user)):
    """Update the rating of a task."""
    caller_uid = current_user.get("uid")
    if request.user_id != caller_uid:
        raise HTTPException(status_code=403, detail="user_id must match your account")
    response = await task_service.update_rating(request)
    return {"response": response}


@router.post("/{task_id}/reward")
async def reward_task(task_id: str, request: TaskRewarded, current_user: dict = Depends(get_current_user_strict)):
    """Reward a user for completing a task."""
    caller_uid = _require_parent(current_user)
    if request.user_id != caller_uid:
        raise HTTPException(status_code=403, detail="user_id must match your account")
    if task_id != request.task_id:
        raise HTTPException(status_code=400, detail="task_id in path and body must match")
    # Parent role alone is not enough: without this, any parent could reward a
    # task belonging to a different family and credit that family's child.
    await _require_task_owner(request.task_id, caller_uid)
    response = await task_service.reward_task(request)
    return {"response": response}


@router.post("/{task_id}/update")
async def update_task(task_id: str, request: TaskUpdated, current_user: dict = Depends(get_current_user)):
    """Update the fields of a task."""
    caller_uid = _require_parent(current_user)
    await _require_task_owner(request.task_id, caller_uid)
    response = await task_service.update_task(request)
    return {"response": response}


@router.post("/{task_id}/verify")
async def verify_task(task_id: str, request: TaskVerified, raw_request: Request, current_user: dict = Depends(get_current_user)):
    """Mark a task as verified."""
    caller_uid = _require_parent(current_user)
    if request.user_id != caller_uid:
        raise HTTPException(status_code=403, detail="user_id must match your account")
    if task_id != request.task_id:
        raise HTTPException(status_code=400, detail="task_id in path and body must match")
    # Verification initiates an XRPL payment drawn against the *task owner's*
    # wallet (task_service._trigger_xrpl_payment reads the owner's profile and
    # Xumm user_token). Without an ownership check, any parent could push
    # signing requests at another parent's wallet.
    await _require_task_owner(request.task_id, caller_uid)
    auth_header = raw_request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()
    response = await task_service.verify_task(request, auth_token=token)
    return {"response": response}


@router.get("/user/{user_id}")
async def get_all_tasks(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get all tasks for a user."""
    caller_uid = current_user.get("uid")
    caller_role = _get_caller_role(current_user)
    if caller_uid != user_id and caller_role not in ("parent", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return await task_service.get_all_tasks(user_id)


@router.get("/{task_id}")
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Get task by ID."""
    response = await task_service.get_task(task_id)
    return {"response": response}


# Leaderboard Routes
@router.get("/leaderboard/family/{parent_id}")
async def get_family_leaderboard(parent_id: str, current_user: dict = Depends(get_current_user)):
    """Get family leaderboard for parent view."""
    caller_uid = current_user.get("uid")
    if caller_uid != parent_id and _get_caller_role(current_user) != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return await leaderboard_service.get_family_leaderboard(parent_id)


@router.get("/leaderboard/kid/{kid_id}")
async def get_kid_leaderboard_view(kid_id: str, current_user: dict = Depends(get_current_user)):
    """Get kid-specific leaderboard view."""
    _require_self_or_guardian(kid_id, current_user)
    return await leaderboard_service.get_kid_leaderboard_view(kid_id)


@router.get("/leaderboard/global")
async def get_global_leaderboard(
    limit: int = Query(default=100, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get enhanced global leaderboard.

    Open to any signed-in user by design — it is a global ranking. Note it
    exposes children's display names across families; narrowing that to
    initials or opt-in is a product decision, not a bug fix.
    """
    return await leaderboard_service.get_enhanced_global_leaderboard(limit)
