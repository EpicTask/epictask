from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from ...domain.notification_models import Notification, NotificationUpdate
from ...services.notifications.notification_service import notification_service
from ...config.security import get_user_id


router = APIRouter()

@router.get("/", response_model=List[Notification])
async def get_notifications(
    user_id: str = Depends(get_user_id),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = False
):
    """
    Get notifications for the current user.
    """
    try:
        notifications = await notification_service.get_notifications(user_id, limit, unread_only)
        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{notification_id}/read", response_model=bool)
async def mark_as_read(
    notification_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Mark a notification as read.
    """
    try:
        success = await notification_service.mark_as_read(notification_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        return success
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mark-all-read", response_model=int)
async def mark_all_as_read(
    user_id: str = Depends(get_user_id)
):
    """
    Mark all notifications for the current user as read.
    """
    try:
        count = await notification_service.mark_all_as_read(user_id)
        return count
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{notification_id}", response_model=bool)
async def delete_notification(
    notification_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Delete a notification.
    """
    try:
        success = await notification_service.delete_notification(notification_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        return success
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
