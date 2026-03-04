from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class NotificationType(str, Enum):
    """Types of notifications"""
    TASK_ASSIGNED = "TASK_ASSIGNED"
    TASK_COMPLETED = "TASK_COMPLETED"
    TASK_VERIFIED = "TASK_VERIFIED"
    TASK_REJECTED = "TASK_REJECTED"
    REWARD_EARNED = "REWARD_EARNED"
    SYSTEM_ALERT = "SYSTEM_ALERT"
    FAMILY_INVITE = "FAMILY_INVITE"

class NotificationBase(BaseModel):
    """Base notification model"""
    recipient_id: str
    title: str
    message: str
    type: NotificationType
    metadata: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    pass

class Notification(NotificationBase):
    """Notification model for response"""
    id: str
    is_read: bool = False
    created_at: datetime
    read_at: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    is_read: Optional[bool] = None
