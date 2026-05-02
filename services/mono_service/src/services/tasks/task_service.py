from typing import List, Dict, Any, Optional
import os
import httpx

from ...storage.db import user_db
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

    async def verify_task(self, request: TaskVerified, auth_token: str = "") -> str:
        """Verify a task."""
        response = task_db.update_task("TaskVerified", request)

        # Trigger XRPL payment for "Pay Directly" tasks
        try:
            task = task_db.get_task(request.task_id)
            if task and isinstance(task, dict):
                if task.get("payment_method") == "Pay Directly" and request.verified:
                    await self._trigger_xrpl_payment(task, request.task_id, auth_token)
        except Exception as e:
            print(f"Error triggering XRPL payment: {e}")

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

    async def _trigger_xrpl_payment(self, task: dict, task_id: str, auth_token: str) -> None:
        if task.get("payment_submitted"):
            print(f"Payment already submitted for task {task_id}, skipping duplicate")
            return

        xrpl_url = os.getenv("XRPL_SERVICE_URL", "")

        parent_profile = user_db.get_user_profile(task.get("user_id"))
        assignee_ids = task.get("assigned_to_ids") or []
        child_profile = user_db.get_user_profile(assignee_ids[0]) if assignee_ids else None

        source_wallet = parent_profile.get("wallet_address") if parent_profile else None
        dest_wallet = child_profile.get("wallet_address") if child_profile else None

        if not source_wallet or not dest_wallet:
            print(f"Payment skipped for task {task_id}: missing wallet — source={bool(source_wallet)} dest={bool(dest_wallet)}")
            return

        xumm_token_obj = (parent_profile.get("userToken") or {})
        user_token = xumm_token_obj.get("user_token") if isinstance(xumm_token_obj, dict) else None

        xrpl_payload = {
            "type": "payment",
            "amount": task.get("reward_amount"),
            "source": source_wallet,
            "destination": dest_wallet,
            "user_token": user_token,
            "task_id": task_id,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{xrpl_url}/payment_request",
                json=xrpl_payload,
                headers={"Authorization": f"Bearer {auth_token}"},
                timeout=10.0,
            )
            resp.raise_for_status()
            task_db.mark_payment_submitted(task_id)
            print(f"Payment request submitted for task {task_id}")

    async def get_all_tasks(self, user_id: str) -> Dict[str, Any]:
        """Get all tasks for a user."""
        return task_db.get_tasks(user_id)

    async def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get a specific task."""
        return task_db.get_task(task_id)

task_service = TaskService()
