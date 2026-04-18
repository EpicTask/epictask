from typing import Dict, Any, Optional
from ...storage.db import user_db
from ...domain.user_models import UserProfileUpdate, InviteCodeResponse, LinkChildRequest, UserMetrics, NotificationPreferencesUpdate
from ...domain.notification_models import NotificationType, NotificationCreate
from ..notifications.notification_service import notification_service

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
        # The user_db function returns {"message": "...", "child_id": "...", "parent_name": "..."} hopefully?
        # Checking user_db.link_child_account implementation again.
        # It currently returns just {"message": "Child linked successfully."}.
        # I need to modify user_db to return more info OR fetch it here.
        # Fetching here is safer to avoid changing db signature too much if used elsewhere (though it's mono_service now).
        
        # Actually, user_db.link_child_account consumes the invite code, so I can't look it up after.
        # But I can look up the parent profile to get their name.
        
        # Let's modify user_db to return the child_id so we know who to notify.
        # Wait, I can't easily modify user_db return type without checking all callers.
        # But I'm the one writing the service.
        
        # Let's check if I can pass the child_id notification logic INTO user_db? No, keep logic in service.
        
        # I'll update user_db.link_child_account to return the child_id.
        result = user_db.link_child_account(parent_uid, request.invite_code)
        
        if result and "child_id" in result:
            child_id = result["child_id"]
            
            # Notify child
            try:
                parent_profile = user_db.get_user_profile(parent_uid)
                parent_name = parent_profile.get("display_name", "A parent") if parent_profile else "A parent"
                
                notification = NotificationCreate(
                    recipient_id=child_id,
                    title="Family Link Successful",
                    message=f"You have been successfully linked to {parent_name}'s family account.",
                    type=NotificationType.FAMILY_INVITE,
                    metadata={"parent_uid": parent_uid, "parent_name": parent_name}
                )
                await notification_service.send_notification(notification)
                
                # Notify parent (optional, but good UX)
                notification_parent = NotificationCreate(
                    recipient_id=parent_uid,
                    title="New Family Member",
                    message="A new family member has been successfully linked to your account.",
                    type=NotificationType.SYSTEM_ALERT,
                    metadata={"child_id": child_id}
                )
                await notification_service.send_notification(notification_parent)
                
            except Exception as e:
                print(f"Warning: Failed to send link notification: {e}")
                
        return result

    async def get_metrics(self) -> UserMetrics:
        """Get user metrics."""
        return user_db.get_user_metrics()

    async def get_notification_preferences(self, uid: str):
        """Get notification preferences."""
        return user_db.get_notification_preferences(uid)

    async def update_notification_preferences(self, uid: str, prefs_update: NotificationPreferencesUpdate) -> bool:
        """Update notification preferences."""
        data = prefs_update.model_dump(exclude_unset=True)
        return user_db.update_notification_preferences(uid, data)

    async def ask_parent_for_help(self, kid_uid: str) -> bool:
        """Send a help request notification from a kid to their linked parent."""
        kid_profile = user_db.get_user_profile(kid_uid)
        if not kid_profile:
            raise ValueError("Child profile not found")
        
        parent_uid = kid_profile.get("parent")
        if not parent_uid:
            raise ValueError("No linked parent found for this child")
            
        kid_name = kid_profile.get("display_name", "Your child")
        
        notification = NotificationCreate(
            recipient_id=parent_uid,
            title="Help Needed!",
            message=f"{kid_name} needs help in the EpicTask app. Check in with them!",
            type=NotificationType.SYSTEM_ALERT,
            metadata={"kid_uid": kid_uid, "help_request": True}
        )
        
        try:
            await notification_service.send_notification(notification)
            return True
        except Exception as e:
            print(f"Failed to send help request notification: {e}")
            return False

user_service = UserService()
