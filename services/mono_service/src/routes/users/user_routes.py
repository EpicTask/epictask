from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ...domain.user_models import UserProfileUpdate, InviteCodeRequest, LinkChildRequest, FcmTokenUpdate, NotificationPreferencesUpdate
from ...services.users.user_service import user_service
from ...config.security import get_current_user
from ...storage.db import user_db

class VerifyPinRequest(BaseModel):
    child_id: str
    pin: str

router = APIRouter()

@router.put("/profile", dependencies=[Depends(get_current_user)])
async def update_profile(
    request: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
    uid = current_user['uid']
    success = await user_service.update_profile(uid, request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    return {"message": "Successful profile update"}

@router.delete("/account", dependencies=[Depends(get_current_user)])
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user account."""
    uid = current_user['uid']
    success = await user_service.delete_account(uid)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )
    return {"message": "Successful user account deletion"}

@router.post("/invite-code", dependencies=[Depends(get_current_user)])
async def generate_invite_code(current_user: dict = Depends(get_current_user)):
    """Generate invite code for a child."""
    # Logic in Node.js used req.user.uid as childId. 
    # Usually this endpoint is called BY THE CHILD.
    uid = current_user['uid']
    return await user_service.generate_invite_code(uid)

@router.post("/link-child", dependencies=[Depends(get_current_user)])
async def link_child(
    request: LinkChildRequest,
    current_user: dict = Depends(get_current_user)
):
    """Link child account (for parents)."""
    uid = current_user['uid']
    try:
        return await user_service.link_child(uid, request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/admin/metrics")
async def get_metrics(current_user: dict = Depends(get_current_user)):
    """Get user metrics (Admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return await user_service.get_metrics()


@router.put("/fcm-token", dependencies=[Depends(get_current_user)])
async def register_fcm_token(
    request: FcmTokenUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Register or rotate the caller's device push token.

    Called by the React Native app on launch (after sign-in) and whenever
    expo-notifications reports that the token has been refreshed.
    The token is stored on the user's Firestore profile document and used by
    notification_service._dispatch_fcm() when sending push notifications.
    """
    uid = current_user["uid"]
    success = user_db.update_fcm_token(uid, request.token, request.platform)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register push token",
        )
    return {"message": "Push token registered successfully"}


@router.delete("/fcm-token", dependencies=[Depends(get_current_user)])
async def unregister_fcm_token(current_user: dict = Depends(get_current_user)):
    """Remove the caller's push token (e.g. on sign-out or notifications disabled)."""
    uid = current_user["uid"]
    user_db.clear_fcm_token(uid)
    return {"message": "Push token removed"}

@router.get("/preferences/notifications", dependencies=[Depends(get_current_user)])
async def get_notification_preferences(current_user: dict = Depends(get_current_user)):
    """Get notification preferences."""
    uid = current_user['uid']
    return await user_service.get_notification_preferences(uid)

@router.put("/preferences/notifications", dependencies=[Depends(get_current_user)])
async def update_notification_preferences(
    request: NotificationPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update notification preferences."""
    uid = current_user['uid']
    success = await user_service.update_notification_preferences(uid, request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )
    return {"message": "Successful preferences update"}

@router.post("/verify-pin")
async def verify_pin(request: VerifyPinRequest):
    """Verify child PIN server-side with rate limit tracking."""
    # Track attempts per child ID
    attempts = getattr(verify_pin, "_attempts", {})
    count = attempts.get(request.child_id, 0)
    
    if count >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Too many failed attempts."
        )
        
    res = user_db.verify_child_pin(request.child_id, request.pin)
    if not res.get("success"):
        attempts[request.child_id] = count + 1
        setattr(verify_pin, "_attempts", attempts)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.get("message", "Invalid PIN")
        )
        
    # Reset attempts on success
    attempts[request.child_id] = 0
    setattr(verify_pin, "_attempts", attempts)
    return res

@router.post("/ask-help", dependencies=[Depends(get_current_user)])
async def ask_parent_for_help(current_user: dict = Depends(get_current_user)):
    """Kid requests help from their parent."""
    uid = current_user['uid']
    try:
        success = await user_service.ask_parent_for_help(uid)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send help request"
            )
        return {"message": "Help request sent successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
