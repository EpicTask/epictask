from typing import List, Optional
from datetime import datetime
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
    unread_only: bool = False
) -> List[Notification]:
    """Get notifications for a user."""
    try:
        collection_ref = db.collection(collections.NOTIFICATIONS)
        query = collection_ref.where("recipient_id", "==", user_id)
        
        if unread_only:
            query = query.where("is_read", "==", False)
            
        query = query.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
        
        docs = query.stream()
        notifications = []
        
        for doc in docs:
            data = doc.to_dict()
            # Convert Firestore timestamp to datetime if necessary, though Pydantic might handle it if it's a datetime object
            # Firestore returns datetime objects with timezone info
            
            notifications.append(Notification(
                id=doc.id,
                recipient_id=data.get("recipient_id"),
                title=data.get("title"),
                message=data.get("message"),
                type=data.get("type"),
                metadata=data.get("metadata"),
                is_read=data.get("is_read", False),
                created_at=data.get("created_at"),
                read_at=data.get("read_at")
            ))
            
        return notifications
        
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
    """Mark all notifications for a user as read."""
    try:
        collection_ref = db.collection(collections.NOTIFICATIONS)
        query = collection_ref.where("recipient_id", "==", user_id).where("is_read", "==", False)
        
        batch = db.batch()
        docs = query.stream()
        count = 0
        
        for doc in docs:
            batch.update(doc.reference, {
                "is_read": True,
                "read_at": firestore.SERVER_TIMESTAMP
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
