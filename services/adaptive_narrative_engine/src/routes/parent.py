"""API routes for parent monitoring and control of narrative features."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.config.security import get_current_user, get_user_id
from src.domain.models import (
    ParentNarrativeSettings,
    KidProgressSummary,
    PayoutApprovalRequest,
    PayoutApprovalResponse
)
from src.services.parent_service import parent_service
from src.adapters.pubsub_publisher import pubsub_publisher

router = APIRouter(prefix="/parent", tags=["parent"])


@router.get("/kids/{kid_id}/progress", response_model=List[dict])
async def get_kid_narrative_progress(
    kid_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get narrative progress for a specific kid.
    
    - **kid_id**: Kid's user ID
    
    Returns list of story progress records with details:
    - Story title and metadata
    - Current progress (nodes completed, XP earned)
    - Last activity timestamp
    - Completion status
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Must be linked to the specified kid
    """
    parent_id = get_user_id(current_user)
    
    # Verify parent-kid relationship
    is_linked = await parent_service.verify_parent_kid_link(parent_id, kid_id)
    if not is_linked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this kid's progress"
        )
    
    progress = await parent_service.get_kid_narrative_progress(kid_id)
    return progress


@router.get("/kids/progress/summary", response_model=List[KidProgressSummary])
async def get_all_kids_progress_summary(
    current_user: dict = Depends(get_current_user)
):
    """
    Get narrative progress summary for all linked kids.
    
    Returns summarized progress for each kid:
    - Total stories started/completed
    - Total XP earned from narratives
    - Total payouts received
    - Recent activity
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Returns data only for linked kids
    """
    parent_id = get_user_id(current_user)
    
    summaries = await parent_service.get_all_kids_progress_summary(parent_id)
    return summaries


@router.get("/payouts/pending", response_model=List[dict])
async def get_pending_payouts(
    kid_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all pending payout requests for linked kids.
    
    - **kid_id**: Optional filter by specific kid
    
    Returns list of pending payout requests requiring approval:
    - Request details (amount, story, node)
    - Kid information
    - Request timestamp
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Returns payouts only for linked kids
    """
    parent_id = get_user_id(current_user)
    
    # If kid_id specified, verify link
    if kid_id:
        is_linked = await parent_service.verify_parent_kid_link(parent_id, kid_id)
        if not is_linked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this kid's payouts"
            )
    
    payouts = await parent_service.get_pending_payouts(parent_id, kid_id)
    return payouts


@router.post("/payouts/{request_id}/approve", response_model=PayoutApprovalResponse)
async def approve_payout(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Approve a pending payout request.
    
    - **request_id**: Payout request identifier
    
    Approves the payout and initiates transfer to parent's wallet.
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Must be linked to kid who requested payout
    """
    parent_id = get_user_id(current_user)
    
    # Verify parent owns this payout request
    payout = await parent_service.get_payout_request(request_id)
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout request not found"
        )
    
    is_linked = await parent_service.verify_parent_kid_link(parent_id, payout["user_id"])
    if not is_linked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to approve this payout"
        )
    
    # Approve and process payout
    result = await parent_service.approve_payout(request_id, parent_id)
    
    # Publish approval event
    try:
        await pubsub_publisher.publish_payout_approved_event(
            request_id=request_id,
            parent_id=parent_id,
            kid_id=payout["user_id"],
            amount=payout["amount"],
            wallet_address=payout["wallet_address"]
        )
    except Exception as e:
        print(f"Failed to publish payout approval event: {str(e)}")
    
    return result


@router.post("/payouts/{request_id}/reject", response_model=PayoutApprovalResponse)
async def reject_payout(
    request_id: str,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Reject a pending payout request.
    
    - **request_id**: Payout request identifier
    - **reason**: Optional rejection reason
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Must be linked to kid who requested payout
    """
    parent_id = get_user_id(current_user)
    
    # Verify parent owns this payout request
    payout = await parent_service.get_payout_request(request_id)
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout request not found"
        )
    
    is_linked = await parent_service.verify_parent_kid_link(parent_id, payout["user_id"])
    if not is_linked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reject this payout"
        )
    
    result = await parent_service.reject_payout(request_id, parent_id, reason)
    
    # Publish rejection event
    try:
        await pubsub_publisher.publish_payout_rejected_event(
            request_id=request_id,
            parent_id=parent_id,
            kid_id=payout["user_id"],
            reason=reason
        )
    except Exception as e:
        print(f"Failed to publish payout rejection event: {str(e)}")
    
    return result


@router.get("/settings/{kid_id}", response_model=ParentNarrativeSettings)
async def get_narrative_settings(
    kid_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get narrative settings for a specific kid.
    
    - **kid_id**: Kid's user ID
    
    Returns:
    - Payout settings (enabled, wallet address, limits)
    - Content filters (age restrictions, topics)
    - Notification preferences
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Must be linked to the specified kid
    """
    parent_id = get_user_id(current_user)
    
    # Verify parent-kid relationship
    is_linked = await parent_service.verify_parent_kid_link(parent_id, kid_id)
    if not is_linked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view settings for this kid"
        )
    
    settings = await parent_service.get_narrative_settings(kid_id)
    return settings


@router.put("/settings/{kid_id}", response_model=ParentNarrativeSettings)
async def update_narrative_settings(
    kid_id: str,
    settings: ParentNarrativeSettings,
    current_user: dict = Depends(get_current_user)
):
    """
    Update narrative settings for a specific kid.
    
    - **kid_id**: Kid's user ID
    - **settings**: Updated settings
    
    Updates:
    - Payout controls (enable/disable, wallet, limits)
    - Content filters (age, topics, blocked content)
    - Notification preferences
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Must be linked to the specified kid
    """
    parent_id = get_user_id(current_user)
    
    # Verify parent-kid relationship
    is_linked = await parent_service.verify_parent_kid_link(parent_id, kid_id)
    if not is_linked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update settings for this kid"
        )
    
    updated_settings = await parent_service.update_narrative_settings(kid_id, settings, parent_id)
    
    # Publish settings update event
    try:
        await pubsub_publisher.publish_settings_updated_event(
            parent_id=parent_id,
            kid_id=kid_id,
            settings=updated_settings.dict()
        )
    except Exception as e:
        print(f"Failed to publish settings update event: {str(e)}")
    
    return updated_settings


@router.get("/analytics/{kid_id}", response_model=dict)
async def get_kid_narrative_analytics(
    kid_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """
    Get narrative learning analytics for a specific kid.
    
    - **kid_id**: Kid's user ID
    - **days**: Number of days to analyze (default 30, max 365)
    
    Returns:
    - Story completion trends
    - Learning velocity (XP per day)
    - Topic preferences
    - Engagement metrics
    - Payout history
    
    **Parent Authentication Required:**
    - Must be authenticated as parent
    - Must be linked to the specified kid
    """
    parent_id = get_user_id(current_user)
    
    # Verify parent-kid relationship
    is_linked = await parent_service.verify_parent_kid_link(parent_id, kid_id)
    if not is_linked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view analytics for this kid"
        )
    
    analytics = await parent_service.get_narrative_analytics(kid_id, days)
    return analytics
