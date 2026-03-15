from typing import List
from firebase_admin import messaging

from ...storage import notification_db
from ...storage import user_db
from ...domain.notification_models import (
    NotificationCreate,
    Notification,
    NotificationType,
    NotificationUpdate,
)


class NotificationService:
    """Service for managing notifications."""
    
    async def send_notification(self, request: NotificationCreate) -> str:
        """Persist a notification record and dispatch an FCM push."""
        notification_id = notification_db.create_notification(request)
        await self._dispatch_fcm(request)
        return notification_id

    async def get_notifications(
        self,
        user_id: str,
        limit: int = 20,
        unread_only: bool = False,
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

    # ------------------------------------------------------------------
    # Convenience helpers (specific notification types)
    # ------------------------------------------------------------------

    async def notify_task_assigned(
        self,
        recipient_id: str,
        task_title: str,
        assigner_name: str,
        task_id: str,
    ):
        """Send a task-assigned notification."""
        notification = NotificationCreate(
            recipient_id=recipient_id,
            title="New Task Assigned",
            message=f"{assigner_name} assigned you a new task: {task_title}",
            type=NotificationType.TASK_ASSIGNED,
            metadata={"task_id": task_id, "assigner_name": assigner_name},
        )
        await self.send_notification(notification)

    async def notify_task_completed(
        self,
        recipient_id: str,
        task_title: str,
        completer_name: str,
        task_id: str,
    ):
        """Send a task-completed notification."""
        notification = NotificationCreate(
            recipient_id=recipient_id,
            title="Task Completed! 🎉",
            message=f"{completer_name} completed the task: {task_title}",
            type=NotificationType.TASK_COMPLETED,
            metadata={"task_id": task_id, "completer_name": completer_name},
        )
        await self.send_notification(notification)

    async def notify_task_verified(
        self, recipient_id: str, task_title: str, task_id: str
    ):
        """Send a task-verified notification."""
        notification = NotificationCreate(
            recipient_id=recipient_id,
            title="Task Verified ✅",
            message=f"Your task '{task_title}' has been verified!",
            type=NotificationType.TASK_VERIFIED,
            metadata={"task_id": task_id},
        )
        await self.send_notification(notification)

    async def notify_reward_earned(
        self,
        recipient_id: str,
        task_title: str,
        task_id: str,
        reward_amount: float | None = None,
        currency: str | None = None,
    ):
        """Send a reward-earned notification."""
        amount_str = f" ({reward_amount} {currency})" if reward_amount else ""
        notification = NotificationCreate(
            recipient_id=recipient_id,
            title="Reward Earned! 🏆",
            message=f"You earned a reward{amount_str} for completing '{task_title}'!",
            type=NotificationType.REWARD_EARNED,
            metadata={
                "task_id": task_id,
                "reward_amount": str(reward_amount) if reward_amount else None,
                "currency": currency,
            },
        )
        await self.send_notification(notification)

    # ------------------------------------------------------------------
    # Private: FCM dispatch
    # ------------------------------------------------------------------

    async def _dispatch_fcm(self, notification: NotificationCreate) -> None:
        """Fetch the recipient's push token and send an FCM / APNs message.

        This is intentionally non-blocking — any error is logged and swallowed
        so that notification persistence is never affected by push failures.
        """
        try:
            token = user_db.get_fcm_token(notification.recipient_id)
            if not token:
                return  # User hasn't registered a push token yet

            # Build safe string metadata for the FCM data payload
            data_payload: dict[str, str] = {
                "notification_type": str(notification.type.value),
            }
            if notification.metadata:
                for k, v in notification.metadata.items():
                    if v is not None:
                        data_payload[k] = str(v)

            message = messaging.Message(
                notification=messaging.Notification(
                    title=notification.title,
                    body=notification.message,
                ),
                data=data_payload,
                token=token,
                # Android channel — create "epictask_notifications" in the app
                android=messaging.AndroidConfig(
                    notification=messaging.AndroidNotification(
                        channel_id="epictask_notifications",
                        priority="high",
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(sound="default", badge=1)
                    )
                ),
            )

            messaging.send(message)
            print(
                f"FCM push sent to {notification.recipient_id} "
                f"[{notification.type.value}]"
            )

        except messaging.UnregisteredError:
            # Token is no longer valid — clean it up so we don't retry
            print(
                f"FCM token for {notification.recipient_id} is unregistered; "
                "clearing from profile."
            )
            user_db.clear_fcm_token(notification.recipient_id)

        except Exception as e:
            # Never let push failures bubble up to the caller
            print(f"Warning: FCM dispatch failed for {notification.recipient_id}: {e}")


notification_service = NotificationService()
