import datetime
from typing import Optional, List, Dict, Any
from firebase_admin import auth, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..config.firebase_config import db
from ..config.collection_names import collections
from ..domain.user_models import UserProfile, InviteCodeResponse, UserMetrics

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
    """Generate a unique invite code for a child."""
    try:
        invites_ref = db.collection(collections.INVITES)
        new_invite_ref = invites_ref.document()
        invite_code = new_invite_ref.id
        
        # Expires in 24 hours
        expires_at = datetime.datetime.now() + datetime.timedelta(hours=24)
        
        invite_data = {
            "childId": child_id,
            "expiresAt": expires_at
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
        
        # Check expiration (using timestamp from Firestore)
        expires_at = invite_data.get('expiresAt')
        # Handle both datetime object (if local) and Firestore timestamp
        if hasattr(expires_at, 'timestamp'):
            # It's a datetime-like object
            pass
        else:
            # Assume it might be a timestamp, convert if needed or compare directly
             # In Python Admin SDK, it returns datetime objects with timezone
             pass

        # Simple comparison if both are datetime
        if expires_at and expires_at.timestamp() < datetime.datetime.now().timestamp():
             raise ValueError("Expired invite code")

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
        
        return {"message": "Child linked successfully."}
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
