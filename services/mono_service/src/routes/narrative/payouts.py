"""API routes for payout management."""
from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from ...config.security import get_current_user, get_user_id
from ...config.firebase_config import db
from ...config.collection_names import collections
from ...domain.narrative_models import PayoutRequest, PayoutRequestRecord
from ...domain.narrative_validators import validate_payout_amount, validate_user_ownership
from ...adapters.pubsub_publisher import pubsub_publisher

# from src.services.payout_service import payout_service

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
    """
    user_id = get_user_id(current_user)
    validate_user_ownership(user_id, request.user_id)
    
    # Validate amount
    validate_payout_amount(request.amount)
    
    # Create payout request record directly
    request_id = str(uuid.uuid4())
    payout_record = PayoutRequestRecord(
        request_id=request_id,
        user_id=request.user_id,
        wallet_address=request.wallet_address,
        token=request.token,
        amount=request.amount,
        reason=request.reason,
        story_id=request.story_id,
        node_id=request.node_id,
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Save to Firestore
    db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id).set(payout_record.model_dump())
    
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
    
    # Payout processing is handled by external service listening to Pub/Sub or polling
    
    return {
        "request_id": payout_record.request_id,
        "status": payout_record.status,
        "message": "Payout request created (pending external processing)",
        "wallet_address": payout_record.wallet_address,
        "amount": payout_record.amount,
        "token": payout_record.token,
        "transaction_hash": None
    }


@router.get("/{request_id}", response_model=PayoutRequestRecord)
async def get_payout_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a payout request by ID.
    
    - **request_id**: Payout request identifier
    """
    user_id = get_user_id(current_user)
    
    doc = db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id).get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout request not found"
        )
    
    data = doc.to_dict()
    data["request_id"] = doc.id
    
    # Verify ownership
    validate_user_ownership(user_id, data.get("user_id"))
    
    return data


@router.get("/user/{user_id}", response_model=List[PayoutRequestRecord])
async def get_user_payouts(
    user_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all payout requests for a user.
    
    - **user_id**: User identifier
    """
    auth_user_id = get_user_id(current_user)
    validate_user_ownership(auth_user_id, user_id)
    
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
    """
    # TODO: Add service-to-service authentication
    
    doc_ref = db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id)
    doc = doc_ref.get()
    
    if not doc.exists:
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
    
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    if transaction_hash:
        update_data["transaction_hash"] = transaction_hash
        
    doc_ref.update(update_data)
    
    return {
        "request_id": request_id,
        "status": status,
        "message": "Payout status updated"
    }
