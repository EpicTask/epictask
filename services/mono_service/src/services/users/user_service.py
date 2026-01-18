from typing import Dict, Any, Optional
from ...storage.db import user_db
from ...domain.user_models import UserProfileUpdate, InviteCodeResponse, LinkChildRequest, UserMetrics

class UserService:
    """Service for user management."""

    async def get_user_profile(self, uid: str) -> Optional[dict]:
        """Get user profile."""
        return user_db.get_user_profile(uid)

    async def update_profile(self, uid: str, profile_data: UserProfileUpdate) -> bool:
        """Update user profile."""
        # Convert model to dict, exclude None to avoid overwriting with nulls
        data = profile_data.model_dump(exclude_unset=True)
        return user_db.update_user_profile(uid, data)

    async def delete_account(self, uid: str) -> bool:
        """Delete user account."""
        return user_db.delete_user_account(uid)

    async def generate_invite_code(self, child_id: str) -> InviteCodeResponse:
        """Generate invite code for a child."""
        return user_db.generate_invite_code(child_id)

    async def link_child(self, parent_uid: str, request: LinkChildRequest) -> Dict[str, str]:
        """Link a child account to a parent."""
        return user_db.link_child_account(parent_uid, request.invite_code)

    async def get_metrics(self) -> UserMetrics:
        """Get user metrics."""
        return user_db.get_user_metrics()

user_service = UserService()
