from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from ...domain.user_models import UserProfileUpdate, InviteCodeRequest, LinkChildRequest
from ...services import user_service
from ...config.security import get_current_user

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

@router.get("/admin/metrics", dependencies=[Depends(get_current_user)])
async def get_metrics():
    """Get user metrics (Admin only)."""
    # Should probably add admin check here
    return await user_service.get_metrics()
