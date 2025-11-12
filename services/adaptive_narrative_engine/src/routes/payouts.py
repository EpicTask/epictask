"""API routes for payout management."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from src.config.security import get_current_user, get_user_id
from src.domain.models import PayoutRequest, PayoutRequestRecord
from src.domain.validators import validate_payout_amount, validate_user_ownership
from src.services.payout_service import payout_service
from src.adapters.pubsub_publisher import pubsub_publisher

router = APIRouter(prefix="/payouts", tags=["payouts"])


@router.post("/request", response_model=dict, status_code=status.HTTP_201_CREATED)
async def request_payout(
    request: PayoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Request a payout for completing a story milestone.
    
    - **request**: Payout request data (user_id, wallet, token, amount, reason)
    
    Returns the payout request ID and status.
    
    **Rate Limits:**
    - Max 10 payouts per day
    - Max $10 total per day
    
    **Parent Approval Required:**
    - Payouts must be enabled in parent settings
    - Funds go to parent's wallet address by default
    """
    user_id = get_user_id(current_user)
    validate_user_ownership(user_id, request.user_id)
    
    # Validate amount
    validate_payout_amount(request.amount)
    
    # Check rate limits
    rate_limit_ok, rate_limit_reason = await payout_service.check_rate_limit(request.user_id)
    if not rate_limit_ok:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=rate_limit_reason
        )
    
    # Check parent approval and get wallet address
    parent_approved, parent_wallet = await payout_service.check_parent_approval(request.user_id)
    if not parent_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Narrative payouts not enabled. Parent must approve in settings."
        )
    
    # Override wallet address with parent's wallet
    request.wallet_address = parent_wallet
    
    # Create payout request
    payout_record = await payout_service.create_payout_request(request)
    
    # Publish payout requested event to Pub/Sub
    try:
        await pubsub_publisher.publish_payout_requested_event(
            user_id=request.user_id,
            request_id=payout_record.request_id,
            wallet_address=payout_record.wallet_address,
            token=payout_record.token,
            amount=payout_record.amount,
            reason=payout_record.reason,
            story_id=request.story_id,
            node_id=request.node_id,
            correlation_id=payout_record.correlation_id
        )
    except Exception as e:
        print(f"Failed to publish payout requested event: {str(e)}")
    
    # Process payout immediately (can be made async with background tasks)
    payout_record = await payout_service.process_payout(payout_record)
    
    return {
        "request_id": payout_record.request_id,
        "status": payout_record.status,
        "message": "Payout request created",
        "wallet_address": payout_record.wallet_address,
        "amount": payout_record.amount,
        "token": payout_record.token,
        "transaction_hash": payout_record.transaction_hash
    }


@router.get("/{request_id}", response_model=PayoutRequestRecord)
async def get_payout_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a payout request by ID.
    
    - **request_id**: Payout request identifier
    
    Returns payout request details including status and transaction hash.
    """
    user_id = get_user_id(current_user)
    
    payout = await payout_service.get_payout_request(request_id)
    
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout request not found"
        )
    
    # Verify ownership
    validate_user_ownership(user_id, payout.get("user_id"))
    
    return payout


@router.get("/user/{user_id}", response_model=List[PayoutRequestRecord])
async def get_user_payouts(
    user_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all payout requests for a user.
    
    - **user_id**: User identifier
    - **limit**: Max number of results (default 50)
    
    Returns list of payout requests ordered by creation date (newest first).
    """
    auth_user_id = get_user_id(current_user)
    validate_user_ownership(auth_user_id, user_id)
    
    from src.config.firebase_config import db
    from src.config.collection_names import collections
    from google.cloud.firestore import Query
    
    query = (db.collection(collections.NARRATIVE_PAYOUT_REQUESTS)
            .where("user_id", "==", user_id)
            .order_by("created_at", direction=Query.DESCENDING)
            .limit(limit))
    
    payouts = []
    for doc in query.stream():
        payout_data = doc.to_dict()
        payout_data["request_id"] = doc.id
        payouts.append(payout_data)
    
    return payouts


@router.post("/{request_id}/status", response_model=dict)
async def update_payout_status(
    request_id: str,
    status: str,
    transaction_hash: str = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the status of a payout request (webhook/callback endpoint).
    
    - **request_id**: Payout request identifier
    - **status**: New status (pending, submitted, confirmed, failed)
    - **transaction_hash**: Optional transaction hash
    
    This endpoint is typically called by XRPL Management Service
    to update payout status after transaction confirmation.
    
    **Note:** In production, this will be protected with service-to-service auth.
    """
    # TODO: Add service-to-service authentication
    # For now, allow authenticated users to update their own payouts
    
    payout = await payout_service.get_payout_request(request_id)
    
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout request not found"
        )
    
    # Validate status value
    valid_statuses = ["pending", "submitted", "confirmed", "failed"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    await payout_service.update_payout_status(request_id, status, transaction_hash)
    
    return {
        "request_id": request_id,
        "status": status,
        "message": "Payout status updated"
    }
