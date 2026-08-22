from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from ..config import age_policy

# Deliberately permissive — Firebase Auth is the authority on what constitutes
# a deliverable address. This only rejects obvious typos before we spend a
# round trip, without pulling in the email-validator dependency.
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

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

class ManagedChildCreate(BaseModel):
    """Create a parent-managed child profile for shared-device use (under 13)."""
    display_name: str = Field(..., min_length=1, max_length=60)
    age: int = Field(..., ge=age_policy.MIN_CHILD_AGE, le=age_policy.TEEN_MIN_AGE - 1)
    grade_level: str
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")
    avatar_key: Optional[str] = None
    photo_url: Optional[str] = None
    # Recorded when the parent completes the add-kid flow. Required for
    # under-13 profiles, which exist only under parental consent.
    parental_consent_at: Optional[str] = None


class ChildInviteCreate(BaseModel):
    """Issue a single-use invite so a teen (13+) can create their own account."""
    display_name: str = Field(..., min_length=1, max_length=60)
    age: int = Field(..., ge=age_policy.TEEN_MIN_AGE, le=age_policy.MAX_CHILD_AGE)
    grade_level: str
    child_email: str = Field(..., pattern=EMAIL_PATTERN)
    parental_consent_at: Optional[str] = None


class ChildInviteRedeem(BaseModel):
    """A teen claiming their invite and creating their login."""
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=8, max_length=128)
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")
    avatar_key: Optional[str] = None


class VerifyPinRequest(BaseModel):
    """Parent unlocking a managed child's profile on a shared device."""
    child_id: str
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class ChildPinUpdate(BaseModel):
    """Parent setting or resetting a child's PIN."""
    child_id: str
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")

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
