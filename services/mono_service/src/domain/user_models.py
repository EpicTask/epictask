from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    """User profile model"""
    uid: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
    role: str = Field(..., pattern="^(parent|kid|admin)$")
    children: List[str] = []  # List of child UIDs
    parent: Optional[str] = None  # Parent UID
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    fcm_token: Optional[str] = None          # Device push token (FCM / APNs)
    fcm_token_platform: Optional[str] = None  # "android" | "ios"

    class Config:
        populate_by_name = True


class FcmTokenUpdate(BaseModel):
    """Request body for registering / rotating a device push token."""
    token: str
    platform: str  # "android" | "ios"

class UserProfileUpdate(BaseModel):
    """Model for updating user profile"""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None

class NotificationPreferences(BaseModel):
    """User notification preferences stored in a sub-collection"""
    email: bool = True
    push: bool = True
    sms: bool = False
    reminders: bool = True
    updated_at: datetime = Field(default_factory=datetime.now)

class NotificationPreferencesUpdate(BaseModel):
    """Model for updating notification preferences"""
    email: Optional[bool] = None
    push: Optional[bool] = None
    sms: Optional[bool] = None
    reminders: Optional[bool] = None

class InviteCodeRequest(BaseModel):
    """Request to generate an invite code"""
    child_id: str

class InviteCodeResponse(BaseModel):
    """Response containing the invite code"""
    invite_code: str
    expires_at: datetime
    child_id: str

class LinkChildRequest(BaseModel):
    """Request to link a child account using an invite code"""
    invite_code: str

class UserMetrics(BaseModel):
    """User system metrics"""
    total_users: int
    active_users: int
    parent_users: int
    child_users: int
    registration_trends: Dict[str, int]  # daily, weekly, monthly
    last_updated: datetime

class UserEvent(BaseModel):
    """Generic user event model"""
    event_id: Optional[str] = None
    event_type: str
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    additional_data: Optional[Dict[str, Any]] = None
