import datetime
import secrets
import string
from typing import Optional, List, Dict, Any
from firebase_admin import auth, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from ..config.firebase_config import db
from ..config.collection_names import collections
from ..domain.user_models import UserProfile, InviteCodeResponse, UserMetrics, NotificationPreferences

def hash_pin(pin: str) -> str:
    """Hash a raw 4-digit PIN securely using bcrypt."""
    return pwd_context.hash(pin)

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verify a plain PIN against a bcrypt hash."""
    if not hashed_pin:
        return False
    try:
        return pwd_context.verify(plain_pin, hashed_pin)
    except Exception:
        return False

def get_user_profile(uid: str) -> Optional[dict]:
    """Get user profile from Firestore."""
    try:
        user_ref = db.collection(collections.USERS).document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return None
            
        data = user_doc.to_dict()
        data['uid'] = uid
        return data
    except Exception as e:
        print(f"Failed to get user profile: {e}")
        # In a real app, you might want to raise a custom exception here
        return None

def update_user_profile(uid: str, profile_data: dict) -> bool:
    """Update user profile in Firestore and Firebase Auth."""
    try:
        # Update Firestore
        user_ref = db.collection(collections.USERS).document(uid)
        user_ref.update(profile_data)
        
        # Update Firebase Auth if display_name or photo_url are present
        auth_update = {}
        if 'display_name' in profile_data and profile_data['display_name']:
            auth_update['display_name'] = profile_data['display_name']
        if 'photo_url' in profile_data and profile_data['photo_url']:
            auth_update['photo_url'] = profile_data['photo_url']
            
        if auth_update:
            auth.update_user(uid, **auth_update)
            
        print(f"Profile updated successfully for user: {uid}")
        return True
    except Exception as e:
        print(f"Failed to update profile: {e}")
        return False

def delete_user_account(uid: str) -> bool:
    """Delete user account from Firestore and Firebase Auth."""
    try:
        # Delete from Firestore
        db.collection(collections.USERS).document(uid).delete()
        
        # Delete from Firebase Auth
        auth.delete_user(uid)
        
        print(f"Deleted account for user: {uid}")
        return True
    except Exception as e:
        print(f"Error deleting user account: {e}")
        return False

def generate_invite_code(child_id: str) -> InviteCodeResponse:
    """Generate a 6-character alphanumeric single-use invite code for a child."""
    try:
        alphabet = string.ascii_uppercase + string.digits
        invite_code = ''.join(secrets.choice(alphabet) for _ in range(6))
        
        invites_ref = db.collection(collections.INVITES)
        new_invite_ref = invites_ref.document(invite_code)
        
        # Expires in 7 days
        expires_at = datetime.datetime.now() + datetime.timedelta(days=7)
        
        invite_data = {
            "childId": child_id,
            "expiresAt": expires_at,
            "code": invite_code,
            "attempts": 0,
            "rate_limit_max": 10,
            "used": False
        }
        
        new_invite_ref.set(invite_data)
        
        return InviteCodeResponse(
            invite_code=invite_code,
            expires_at=expires_at,
            child_id=child_id
        )
    except Exception as e:
        print(f"Failed to generate invite code: {e}")
        raise e

def link_child_account(parent_uid: str, invite_code: str) -> Dict[str, str]:
    """Link a child account to a parent using an invite code."""
    try:
        invite_ref = db.collection(collections.INVITES).document(invite_code)
        invite_doc = invite_ref.get()
        
        if not invite_doc.exists:
            raise ValueError("Invalid invite code")
            
        invite_data = invite_doc.to_dict()
        
        expires_at = invite_data.get('expiresAt')
        if expires_at:
            now_utc = datetime.datetime.now(tz=datetime.timezone.utc)
            if getattr(expires_at, 'tzinfo', None):
                expired = expires_at < now_utc
            else:
                expired = expires_at < datetime.datetime.now(datetime.timezone.utc)
            if expired:
                raise ValueError("Invite code has expired")

        child_id = invite_data.get('childId')
        
        # Add child to parent's list and parent to child's list
        parent_ref = db.collection(collections.USERS).document(parent_uid)
        child_ref = db.collection(collections.USERS).document(child_id)
        
        # Use transaction or batch for atomicity? 
        # For simplicity following the Node.js implementation which was sequential awaits
        
        parent_ref.update({"children": firestore.ArrayUnion([child_id])})
        child_ref.update({"parent": parent_uid})
        
        # Delete the invite code after use
        invite_ref.delete()
        
        return {
            "message": "Child linked successfully.",
            "child_id": child_id
        }
    except Exception as e:
        print(f"Failed to link child account: {e}")
        raise e

def get_linked_children(parent_uid: str) -> List[dict]:
    """Get all children linked to a parent."""
    try:
        parent_doc = db.collection(collections.USERS).document(parent_uid).get()
        if not parent_doc.exists:
            raise ValueError("Parent not found")
            
        parent_data = parent_doc.to_dict()
        child_ids = parent_data.get('children', [])
        
        if not child_ids:
            return []
            
        # Firestore 'in' query supports up to 10 (or 30 now) values
        # If there are many children, we might need to batch or loop, 
        # but realistically a parent won't have that many.
        
        children = []
        # Chunking if needed, but for now simple query
        if child_ids:
            # Firestore requires non-empty list for 'in'
            users_ref = db.collection(collections.USERS)
            # Use FieldFilter for better readability/compatibility
            query = users_ref.where(filter=FieldFilter("uid", "in", child_ids))
            docs = query.stream()
            
            for doc in docs:
                child_data = doc.to_dict()
                child_data['uid'] = doc.id
                children.append(child_data)
                
        return children
    except Exception as e:
        print(f"Failed to get linked children: {e}")
        raise e

def get_fcm_token(uid: str) -> Optional[str]:
    """Return the stored FCM / APNs push token for a user, or None."""
    try:
        doc = db.collection(collections.USERS).document(uid).get()
        if not doc.exists:
            return None
        return doc.to_dict().get("fcm_token")
    except Exception as e:
        print(f"Failed to get FCM token for {uid}: {e}")
        return None


def update_fcm_token(uid: str, token: str, platform: str) -> bool:
    """Persist a device push token on the user's profile document."""
    try:
        db.collection(collections.USERS).document(uid).update(
            {"fcm_token": token, "fcm_token_platform": platform}
        )
        return True
    except Exception as e:
        print(f"Failed to update FCM token for {uid}: {e}")
        return False


def clear_fcm_token(uid: str) -> bool:
    """Remove an invalid / expired push token from the user's profile."""
    try:
        db.collection(collections.USERS).document(uid).update(
            {"fcm_token": None, "fcm_token_platform": None}
        )
        return True
    except Exception as e:
        print(f"Failed to clear FCM token for {uid}: {e}")
        return False


def get_user_metrics() -> UserMetrics:
    """Get aggregate user metrics."""
    try:
        users_ref = db.collection(collections.USERS)
        # Note: getting all documents is expensive. 
        # In production, use aggregation queries or counters.
        docs = users_ref.stream()
        
        total_users = 0
        parent_users = 0
        child_users = 0
        
        for doc in docs:
            total_users += 1
            data = doc.to_dict()
            role = data.get('role')
            if role == 'parent':
                parent_users += 1
            else:
                child_users += 1
                
        # Mock calculation for active users as in Node.js
        active_users = int(total_users * 0.7)
        
        return UserMetrics(
            total_users=total_users,
            active_users=active_users,
            parent_users=parent_users,
            child_users=child_users,
            registration_trends={
                "daily": int(total_users * 0.05),
                "weekly": int(total_users * 0.15),
                "monthly": total_users
            },
            last_updated=datetime.datetime.now()
        )
    except Exception as e:
        print(f"Failed to get user metrics: {e}")
        # Return empty metrics on error
        return UserMetrics(
            total_users=0,
            active_users=0,
            parent_users=0,
            child_users=0,
            registration_trends={},
            last_updated=datetime.datetime.now()
        )

def get_notification_preferences(uid: str) -> NotificationPreferences:
    """Get user notification preferences from the sub-collection."""
    try:
        pref_ref = db.collection(collections.USERS).document(uid).collection(collections.PREFERENCES).document("notifications")
        doc = pref_ref.get()
        if doc.exists:
            return NotificationPreferences(**doc.to_dict())
        return NotificationPreferences()  # Return defaults if not found
    except Exception as e:
        print(f"Failed to get notification preferences for {uid}: {e}")
        return NotificationPreferences()

def update_notification_preferences(uid: str, prefs_dict: dict) -> bool:
    """Update user notification preferences in the sub-collection."""
    try:
        pref_ref = db.collection(collections.USERS).document(uid).collection(collections.PREFERENCES).document("notifications")
        prefs_dict['updated_at'] = datetime.datetime.now()
        pref_ref.set(prefs_dict, merge=True)
        return True
    except Exception as e:
        print(f"Failed to update notification preferences for {uid}: {e}")
        return False

def verify_child_pin(child_id: str, pin: str) -> dict:
    """Verify child PIN server-side."""
    try:
        user_doc = db.collection(collections.USERS).document(child_id).get()
        if not user_doc.exists:
            return {"success": False, "message": "Child user not found"}
            
        data = user_doc.to_dict()
        stored_hash = data.get("pin_hash") or data.get("pinHash")
        
        if not stored_hash:
            return {"success": False, "message": "No PIN configured for child"}
            
        is_valid = verify_pin(pin, stored_hash) or (pin == stored_hash)
        if is_valid:
            data['uid'] = child_id
            return {"success": True, "child": data}
        else:
            return {"success": False, "message": "Invalid PIN"}
    except Exception as e:
        print(f"Failed to verify child PIN: {e}")
        return {"success": False, "message": str(e)}