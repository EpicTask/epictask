from typing import List, Dict, Any, Optional
from ...storage.db import notification_db
from ...domain.notification_models import (
    NotificationCreate, 
    Notification, 
    NotificationType,
    NotificationUpdate
)

class NotificationService:
    """Service for managing notifications."""

    async def send_notification(self, request: NotificationCreate) -> str:
        """Send a new notification."""
        # Here we could add logic to dispatch to other channels (e.g., email, push)
        # For now, just save to DB
        return notification_db.create_notification(request)

    async def get_notifications(
        self, 
        user_id: str, 
        limit: int = 20, 
        unread_only: bool = False
    ) -> List[Notification]:
        """Get notifications for a user."""
        return notification_db.get_user_notifications(user_id, limit, unread_only)

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read."""
        return notification_db.mark_as_read(notification_id, user_id)

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications for a user as read."""
        return notification_db.mark_all_as_read(user_id)
        
    async def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification."""
        return notification_db.delete_notification(notification_id, user_id)

    # Helper methods for specific notification types
    async def notify_task_assigned(self, recipient_id: str, task_title: str, assigner_name: str, task_id: str):
        """Send a task assigned notification."""
        notification = NotificationCreate(
            recipient_id=recipient_id,
            title="New Task Assigned",
            message=f"{assigner_name} assigned you a new task: {task_title}",
            type=NotificationType.TASK_ASSIGNED,
            metadata={"task_id": task_id, "assigner_name": assigner_name}
        )
        await self.send_notification(notification)

    async def notify_task_completed(self, recipient_id: str, task_title: str, completer_name: str, task_id: str):
        """Send a task completed notification."""
        notification = NotificationCreate(
            recipient_id=recipient_id,
            title="Task Completed",
            message=f"{completer_name} completed the task: {task_title}",
            type=NotificationType.TASK_COMPLETED,
            metadata={"task_id": task_id, "completer_name": completer_name}
        )
        await self.send_notification(notification)

    async def notify_task_verified(self, recipient_id: str, task_title: str, task_id: str):
        """Send a task verified notification."""
        notification = NotificationCreate(
            recipient_id=recipient_id,
            title="Task Verified",
            message=f"Your task '{task_title}' has been verified!",
            type=NotificationType.TASK_VERIFIED,
            metadata={"task_id": task_id}
        )
        await self.send_notification(notification)

notification_service = NotificationService()
