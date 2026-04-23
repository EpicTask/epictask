from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from ...domain.task_models import (
    TaskCreated, TaskAssigned, TaskCancelled, TaskCommentAdded,
    TaskCompleted, TaskExpired, TaskRatingUpdate, TaskRewarded,
    TaskUpdated, TaskVerified
)
from ...services import task_service, leaderboard_service
from ...config.security import get_current_user

router = APIRouter()


def _require_parent(current_user: dict) -> str:
    """Return caller UID if parent role, else raise 403."""
    if current_user.get("role", "kid") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")
    return current_user.get("uid")


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
async def reward_task(task_id: str, request: TaskRewarded, current_user: dict = Depends(get_current_user)):
    """Reward a user for completing a task."""
    caller_uid = _require_parent(current_user)
    if request.user_id != caller_uid:
        raise HTTPException(status_code=403, detail="user_id must match your account")
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
    auth_header = raw_request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()
    response = await task_service.verify_task(request, auth_token=token)
    return {"response": response}


@router.get("/user/{user_id}")
async def get_all_tasks(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get all tasks for a user."""
    caller_uid = current_user.get("uid")
    caller_role = current_user.get("role", "kid")
    if caller_uid != user_id and caller_role != "parent":
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
    return await leaderboard_service.get_family_leaderboard(parent_id)


@router.get("/leaderboard/kid/{kid_id}")
async def get_kid_leaderboard_view(kid_id: str, current_user: dict = Depends(get_current_user)):
    """Get kid-specific leaderboard view."""
    return await leaderboard_service.get_kid_leaderboard_view(kid_id)


@router.get("/leaderboard/global")
async def get_global_leaderboard(limit: int = 100, current_user: dict = Depends(get_current_user)):
    """Get enhanced global leaderboard."""
    return await leaderboard_service.get_enhanced_global_leaderboard(limit)
