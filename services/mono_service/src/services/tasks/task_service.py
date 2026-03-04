from typing import List, Dict, Any, Optional
from ...storage.db import task_db
from ...domain.task_models import (
    TaskCreated, TaskAssigned, TaskCancelled, TaskCommentAdded,
    TaskCompleted, TaskExpired, TaskRatingUpdate, TaskRewarded,
    TaskUpdated, TaskVerified
)
from ...domain.notification_models import NotificationType, NotificationCreate
from ..notifications.notification_service import notification_service

class TaskService:
    """Service for managing tasks."""

    async def create_task(self, request: TaskCreated) -> str:
        """Create a new task."""
        return task_db.create_task(request)

    async def assign_task(self, request: TaskAssigned) -> str:
        """Assign a task to a user."""
        result = task_db.assign_task("TaskAssigned", request)
        
        # Notify the assigned user
        try:
            task = task_db.get_task(request.task_id)
            if task and isinstance(task, dict):
                await notification_service.notify_task_assigned(
                    recipient_id=request.assigned_to_id,
                    task_title=task.get('task_title', 'Task'),
                    assigner_name="Parent",  # In real app, fetch parent name
                    task_id=request.task_id
                )
        except Exception as e:
            print(f"Warning: Failed to send notification: {e}")
            
        return result

    async def cancel_task(self, request: TaskCancelled) -> str:
        """Cancel a task."""
        # Notify user (if assigned) that task was cancelled
        try:
            task = task_db.get_task(request.task_id)
            if task and isinstance(task, dict) and task.get('assigned_to_ids'):
                for assigned_id in task.get('assigned_to_ids'):
                    notification = NotificationCreate(
                        recipient_id=assigned_id,
                        title="Task Cancelled",
                        message=f"Task '{task.get('task_title')}' has been cancelled.",
                        type=NotificationType.SYSTEM_ALERT,
                        metadata={"task_id": request.task_id}
                    )
                    await notification_service.send_notification(notification)
        except Exception as e:
            print(f"Warning: Failed to send cancellation notification: {e}")
            
        return task_db.delete_task("TaskCancelled", request)

    async def add_comment(self, request: TaskCommentAdded) -> str:
        """Add a comment to a task."""
        # Notify task owner/assignee about new comment
        # (This would need logic to not notify self, skipped for simplicity)
        return task_db.add_comment(request)

    async def complete_task(self, request: TaskCompleted) -> str:
        """Mark a task as completed."""
        result = task_db.completed_task(request)
        
        # Notify the task creator (Parent)
        try:
            task = task_db.get_task(request.task_id)
            if task and isinstance(task, dict):
                creator_id = task.get('user_id')
                if creator_id:
                    await notification_service.notify_task_completed(
                        recipient_id=creator_id,
                        task_title=task.get('task_title', 'Task'),
                        completer_name="Child",  # In real app, fetch child name
                        task_id=request.task_id
                    )
        except Exception as e:
            print(f"Warning: Failed to send completion notification: {e}")
            
        return result

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
        
        # Notify user of reward
        try:
            task = task_db.get_task(request.task_id)
            if task and isinstance(task, dict) and task.get('assigned_to_ids'):
                for assigned_id in task.get('assigned_to_ids'):
                    notification = NotificationCreate(
                        recipient_id=assigned_id,
                        title="Reward Earned!",
                        message=f"You earned a reward for completing '{task.get('task_title')}'!",
                        type=NotificationType.REWARD_EARNED,
                        metadata={
                            "task_id": request.task_id,
                            "reward_amount": task.get('reward_amount'),
                            "currency": task.get('reward_currency')
                        }
                    )
                    await notification_service.send_notification(notification)
        except Exception as e:
            print(f"Warning: Failed to send reward notification: {e}")
            
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
            
        # Notify user (Child) that task is verified
        try:
            task = task_db.get_task(request.task_id)
            if task and isinstance(task, dict) and task.get('assigned_to_ids'):
                # Notify all assignees
                for assigned_id in task.get('assigned_to_ids'):
                    await notification_service.notify_task_verified(
                        recipient_id=assigned_id,
                        task_title=task.get('task_title', 'Task'),
                        task_id=request.task_id
                    )
        except Exception as e:
            print(f"Warning: Failed to send verification notification: {e}")
            
        return response

    async def get_all_tasks(self, user_id: str) -> Dict[str, Any]:
        """Get all tasks for a user."""
        return task_db.get_tasks(user_id)

    async def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get a specific task."""
        return task_db.get_task(task_id)

task_service = TaskService()