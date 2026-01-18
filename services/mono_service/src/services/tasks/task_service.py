from typing import List, Dict, Any, Optional
from ...storage.db import task_db
from ...domain.task_models import (
    TaskCreated, TaskAssigned, TaskCancelled, TaskCommentAdded,
    TaskCompleted, TaskExpired, TaskRatingUpdate, TaskRewarded,
    TaskUpdated, TaskVerified
)

class TaskService:
    """Service for managing tasks."""

    async def create_task(self, request: TaskCreated) -> str:
        """Create a new task."""
        return task_db.create_task(request)

    async def assign_task(self, request: TaskAssigned) -> str:
        """Assign a task to a user."""
        # event_type = "TaskAssigned" - passed implicitly or handled in DB
        # The original code passed event_type string, but db.assign_task doesn't use it in signature 
        # but calls it 'task_event' which is confusing in original code.
        # Checking firestore_db.py: def assign_task(task_event, response):
        # It seems the first arg is ignored or misused in original code.
        # In copied firestore_db.py: def assign_task(task_event, response):
        # task_event seems unused.
        return task_db.assign_task("TaskAssigned", request)

    async def cancel_task(self, request: TaskCancelled) -> str:
        """Cancel a task."""
        return task_db.delete_task("TaskCancelled", request)

    async def add_comment(self, request: TaskCommentAdded) -> str:
        """Add a comment to a task."""
        return task_db.add_comment(request)

    async def complete_task(self, request: TaskCompleted) -> str:
        """Mark a task as completed."""
        return task_db.completed_task(request)

    async def expire_task(self, request: TaskExpired) -> str:
        """Mark a task as expired."""
        return task_db.task_expired(request)

    async def update_rating(self, request: TaskRatingUpdate) -> str:
        """Update task rating."""
        return task_db.task_rating_update(request)

    async def reward_task(self, request: TaskRewarded) -> str:
        """Reward a user for completing a task."""
        response = task_db.update_task("TaskRewarded", request)
        
        # Side effect: Update leaderboard
        try:
            task_db.update_enhanced_leaderboard(request)
        except Exception as e:
            print(f"Warning: Failed to update leaderboard: {e}")
            
        return response

    async def update_task(self, request: TaskUpdated) -> str:
        """Update task fields."""
        return task_db.update_task_fields("TaskUpdated", request)

    async def verify_task(self, request: TaskVerified) -> str:
        """Verify a task."""
        response = task_db.update_task("TaskVerified", request)
        
        # Side effect: Update leaderboard
        try:
            task_db.update_enhanced_leaderboard(request)
        except Exception as e:
            print(f"Warning: Failed to update leaderboard: {e}")
            
        return response

    async def get_all_tasks(self, user_id: str) -> Dict[str, Any]:
        """Get all tasks for a user."""
        return task_db.get_tasks(user_id)

    async def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get a specific task."""
        return task_db.get_task(task_id)

task_service = TaskService()
