from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from ...domain.task_models import (
    TaskCreated, TaskAssigned, TaskCancelled, TaskCommentAdded,
    TaskCompleted, TaskExpired, TaskRatingUpdate, TaskRewarded,
    TaskUpdated, TaskVerified
)
from ...services import task_service, leaderboard_service
from ...config.security import get_current_user

router = APIRouter()

@router.post("/", dependencies=[Depends(get_current_user)])
async def create_task(request: TaskCreated):
    """Create and store a new task."""
    return await task_service.create_task(request)

@router.post("/{task_id}/assign", dependencies=[Depends(get_current_user)])
async def assign_task(request: TaskAssigned):
    """Assign a task to a user."""
    response = await task_service.assign_task(request)
    return {"response": response}

@router.post("/{task_id}/cancel", dependencies=[Depends(get_current_user)])
async def cancel_task(request: TaskCancelled):
    """Cancel a task."""
    response = await task_service.cancel_task(request)
    return {"response": response}

@router.post("/{task_id}/comment", dependencies=[Depends(get_current_user)])
async def add_comment(request: TaskCommentAdded):
    """Add a comment to a task."""
    response = await task_service.add_comment(request)
    return {"response": response}

@router.post("/{task_id}/complete", dependencies=[Depends(get_current_user)])
async def complete_task(request: TaskCompleted):
    """Mark a task as completed."""
    response = await task_service.complete_task(request)
    return {"response": response}

@router.post("/{task_id}/expire", dependencies=[Depends(get_current_user)])
async def expire_task(request: TaskExpired):
    """Mark a task as expired."""
    response = await task_service.expire_task(request)
    return {"response": response}

@router.post("/{task_id}/rating", dependencies=[Depends(get_current_user)])
async def update_rating(request: TaskRatingUpdate):
    """Update the rating of a task."""
    response = await task_service.update_rating(request)
    return {"response": response}

@router.post("/{task_id}/reward", dependencies=[Depends(get_current_user)])
async def reward_task(request: TaskRewarded):
    """Reward a user for completing a task."""
    response = await task_service.reward_task(request)
    return {"response": response}

@router.post("/{task_id}/update", dependencies=[Depends(get_current_user)])
async def update_task(request: TaskUpdated):
    """Update the fields of a task."""
    response = await task_service.update_task(request)
    return {"response": response}

@router.post("/{task_id}/verify", dependencies=[Depends(get_current_user)])
async def verify_task(request: TaskVerified):
    """Mark a task as verified."""
    response = await task_service.verify_task(request)
    return {"response": response}

@router.get("/user/{user_id}", dependencies=[Depends(get_current_user)])
async def get_all_tasks(user_id: str):
    """Get all tasks for a user."""
    return await task_service.get_all_tasks(user_id)

@router.get("/{task_id}", dependencies=[Depends(get_current_user)])
async def get_task(task_id: str):
    """Get task by ID."""
    response = await task_service.get_task(task_id)
    return {"response": response}

# Leaderboard Routes
@router.get("/leaderboard/family/{parent_id}", dependencies=[Depends(get_current_user)])
async def get_family_leaderboard(parent_id: str):
    """Get family leaderboard for parent view."""
    return await leaderboard_service.get_family_leaderboard(parent_id)

@router.get("/leaderboard/kid/{kid_id}", dependencies=[Depends(get_current_user)])
async def get_kid_leaderboard_view(kid_id: str):
    """Get kid-specific leaderboard view."""
    return await leaderboard_service.get_kid_leaderboard_view(kid_id)

@router.get("/leaderboard/global", dependencies=[Depends(get_current_user)])
async def get_global_leaderboard(limit: int = 100):
    """Get enhanced global leaderboard."""
    return await leaderboard_service.get_enhanced_global_leaderboard(limit)
