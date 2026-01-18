from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserProfile(BaseModel):
    """User profile model"""
    uid: str
    display_name: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    role: str = Field(..., pattern="^(parent|kid|admin)$")
    children: List[str] = []  # List of child UIDs
    parent: Optional[str] = None  # Parent UID
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

class UserProfileUpdate(BaseModel):
    """Model for updating user profile"""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    
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
