from typing import List, Optional
from datetime import datetime, timezone
from firebase_admin import firestore

from ..config.firebase_config import db
from ..config.collection_names import collections
from ..config.error_handler import FirestoreOperationException, handle_firestore_exception
from ..domain.notification_models import NotificationCreate, Notification, NotificationUpdate, NotificationType

def create_notification(notification: NotificationCreate) -> str:
    """Create a new notification in Firestore."""
    try:
        collection_ref = db.collection(collections.NOTIFICATIONS)
        doc_ref = collection_ref.document()
        
        data = notification.dict()
        data["created_at"] = firestore.SERVER_TIMESTAMP
        data["is_read"] = False
        data["read_at"] = None
        
        doc_ref.set(data)
        return doc_ref.id
        
    except Exception as e:
        raise FirestoreOperationException(f"Error creating notification: {str(e)}")

def get_user_notifications(
    user_id: str,
    limit: int = 20,
    unread_only: bool = False,
) -> List[Notification]:
    """Get notifications for a user.

    Uses only the auto-indexed ``recipient_id`` field so no composite Firestore
    index is required.  Filtering (unread_only) and sorting (newest-first) are
    done in Python after fetching a generous batch from Firestore.
    """
    try:
        collection_ref = db.collection(collections.NOTIFICATIONS)

        # Fetch up to 3× the requested limit so that Python-side unread
        # filtering still returns enough results in typical cases.
        fetch_limit = limit * 3 if unread_only else limit * 2
        docs = (
            collection_ref
            .where("recipient_id", "==", user_id)
            .limit(fetch_limit)
            .stream()
        )

        notifications: List[Notification] = []
        for doc in docs:
            data = doc.to_dict()
            if not data:
                continue

            # Skip unread-filtered results in Python (avoids composite index)
            if unread_only and data.get("is_read", False):
                continue

            # Normalise the Firestore DatetimeWithNanoseconds → aware datetime
            raw_ts = data.get("created_at")
            if raw_ts is None:
                created_at = datetime.now(tz=timezone.utc)
            elif hasattr(raw_ts, "tzinfo") and raw_ts.tzinfo is not None:
                created_at = raw_ts
            else:
                # naive datetime — attach UTC so Pydantic doesn't reject it
                created_at = raw_ts.replace(tzinfo=timezone.utc) if hasattr(raw_ts, "replace") else datetime.now(tz=timezone.utc)

            raw_read_at = data.get("read_at")
            read_at: Optional[datetime] = None
            if raw_read_at is not None:
                if hasattr(raw_read_at, "tzinfo") and raw_read_at.tzinfo is not None:
                    read_at = raw_read_at
                elif hasattr(raw_read_at, "replace"):
                    read_at = raw_read_at.replace(tzinfo=timezone.utc)

            notifications.append(
                Notification(
                    id=doc.id,
                    recipient_id=data.get("recipient_id", ""),
                    title=data.get("title", ""),
                    message=data.get("message", ""),
                    type=data.get("type", "SYSTEM_ALERT"),
                    metadata=data.get("metadata"),
                    is_read=data.get("is_read", False),
                    created_at=created_at,
                    read_at=read_at,
                )
            )

        # Sort newest-first in Python (no ORDER BY in Firestore query needed)
        notifications.sort(
            key=lambda n: n.created_at or datetime.min.replace(tzinfo=timezone.utc),
            reverse=True,
        )

        return notifications[:limit]

    except Exception as e:
        raise FirestoreOperationException(f"Error fetching notifications: {str(e)}")

def mark_as_read(notification_id: str, user_id: str) -> bool:
    """Mark a notification as read."""
    try:
        doc_ref = db.collection(collections.NOTIFICATIONS).document(notification_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
            
        data = doc.to_dict()
        if data.get("recipient_id") != user_id:
            raise FirestoreOperationException("Unauthorized to access this notification")
            
        doc_ref.update({
            "is_read": True,
            "read_at": firestore.SERVER_TIMESTAMP
        })
        return True
        
    except Exception as e:
        if isinstance(e, FirestoreOperationException):
            raise e
        raise FirestoreOperationException(f"Error updating notification: {str(e)}")

def mark_all_as_read(user_id: str) -> int:
    """Mark all unread notifications for a user as read.

    Uses only the auto-indexed ``recipient_id`` field; unread filtering is done
    in Python to avoid requiring a composite Firestore index.
    """
    try:
        collection_ref = db.collection(collections.NOTIFICATIONS)
        # Fetch all user notifications; filter unread in Python
        docs = collection_ref.where("recipient_id", "==", user_id).limit(200).stream()

        batch = db.batch()
        count = 0

        for doc in docs:
            data = doc.to_dict()
            if data and not data.get("is_read", False):
                batch.update(doc.reference, {
                    "is_read": True,
                    "read_at": firestore.SERVER_TIMESTAMP,
                })
                count += 1

        if count > 0:
            batch.commit()

        return count

    except Exception as e:
        raise FirestoreOperationException(f"Error batch updating notifications: {str(e)}")

def delete_notification(notification_id: str, user_id: str) -> bool:
    """Delete a notification."""
    try:
        doc_ref = db.collection(collections.NOTIFICATIONS).document(notification_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
            
        data = doc.to_dict()
        if data.get("recipient_id") != user_id:
            raise FirestoreOperationException("Unauthorized to delete this notification")
            
        doc_ref.delete()
        return True
        
    except Exception as e:
        if isinstance(e, FirestoreOperationException):
            raise e
        raise FirestoreOperationException(f"Error deleting notification: {str(e)}")
