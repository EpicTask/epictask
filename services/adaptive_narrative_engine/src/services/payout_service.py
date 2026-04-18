"""Service for managing payout requests and rate limiting."""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid

from src.config.firebase_config import db
from src.config.collection_names import collections
from src.domain.models import PayoutRequest, PayoutRequestRecord
from src.services.xrpl_client import xrpl_client


class PayoutService:
    """Service for handling payout logic and rate limiting."""
    
    def __init__(self):
        self.db = db
        # Rate limiting: max payouts per user per day
        self.max_payouts_per_day = 10
        self.max_daily_amount = 10.0  # Max $10 worth per day
    
    async def check_rate_limit(self, user_id: str) -> tuple[bool, str]:
        """
        Check if user has exceeded rate limits for payouts.
        
        Args:
            user_id: User identifier
            
        Returns:
            Tuple of (is_allowed, reason_if_denied)
        """
        # Get payouts from last 24 hours
        cutoff_time = datetime.utcnow() - timedelta(days=1)
        
        query = (self.db.collection(collections.NARRATIVE_PAYOUT_REQUESTS)
                .where("user_id", "==", user_id)
                .where("created_at", ">=", cutoff_time)
                .where("status", "in", ["pending", "submitted", "confirmed"]))
        
        payouts = list(query.stream())
        
        # Check count limit
        if len(payouts) >= self.max_payouts_per_day:
            return False, f"Daily payout limit reached ({self.max_payouts_per_day} payouts)"
        
        # Check amount limit
        total_amount = sum(p.to_dict().get("amount", 0) for p in payouts)
        if total_amount >= self.max_daily_amount:
            return False, f"Daily payout amount limit reached (${self.max_daily_amount})"
        
        return True, ""
    
    async def check_parent_approval_settings(self, user_id: str) -> tuple[bool, Optional[str], bool]:
        """
        Check if parent has approved narrative payouts and get approval settings.
        
        Args:
            user_id: User (kid) identifier
            
        Returns:
            Tuple of (is_approved, parent_wallet_address, manual_approval_required)
        """
        # Get user document
        user_doc = self.db.collection(collections.USERS).document(user_id).get()
        
        if not user_doc.exists:
            return False, None, True
        
        user_data = user_doc.to_dict()
        
        # Check parent ID
        parent_id = user_data.get("parent_id")
        if not parent_id:
            return False, None, True

        # Check narrative settings in dedicated collection
        settings_doc = self.db.collection(collections.NARRATIVE_SETTINGS).document(user_id).get()
        
        if settings_doc.exists:
            settings_data = settings_doc.to_dict()
            payouts_enabled = settings_data.get("payouts_enabled", False)
            manual_approval = settings_data.get("require_manual_approval", True)
            parent_wallet = settings_data.get("parent_wallet_address")
        else:
            # Fallback to defaults or user document if settings don't exist
            payouts_enabled = False
            manual_approval = True
            parent_wallet = None

        if not payouts_enabled:
            return False, None, True
        
        # If wallet not in settings, get from parent document
        if not parent_wallet:
            parent_doc = self.db.collection(collections.USERS).document(parent_id).get()
            if parent_doc.exists:
                parent_data = parent_doc.to_dict()
                parent_wallet = parent_data.get("wallet_address")
        
        if not parent_wallet:
            return False, None, True
        
        return True, parent_wallet, manual_approval
    
    async def create_payout_request(
        self,
        request: PayoutRequest
    ) -> PayoutRequestRecord:
        """
        Create a payout request record in Firestore.
        
        Args:
            request: Payout request data
            
        Returns:
            Created payout request record
        """
        correlation_id = str(uuid.uuid4())
        
        payout_record = PayoutRequestRecord(
            user_id=request.user_id,
            wallet_address=request.wallet_address,
            token=request.token,
            amount=request.amount,
            reason=request.reason,
            story_id=request.story_id,
            node_id=request.node_id,
            task_id=request.task_id,
            status="pending",
            correlation_id=correlation_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save to Firestore
        doc_ref = self.db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document()
        payout_dict = payout_record.model_dump(exclude={"request_id"})
        doc_ref.set(payout_dict)
        
        payout_record.request_id = doc_ref.id
        return payout_record
    
    async def process_payout(
        self,
        payout_record: PayoutRequestRecord
    ) -> PayoutRequestRecord:
        """
        Process a payout request by calling XRPL Management Service.
        
        Args:
            payout_record: Payout request to process
            
        Returns:
            Updated payout record with transaction info
        """
        try:
            # Create reference string
            reference = f"narrative:{payout_record.story_id}#{payout_record.node_id}:{payout_record.correlation_id}"
            
            # Call XRPL Management Service
            xrpl_response = await xrpl_client.create_payout(
                user_id=payout_record.user_id,
                wallet_address=payout_record.wallet_address,
                token=payout_record.token,
                amount=payout_record.amount,
                reference=reference
            )
            
            # Update record with transaction info
            payout_record.status = "submitted"
            payout_record.transaction_hash = xrpl_response.get("txId")
            payout_record.updated_at = datetime.utcnow()
            
        except Exception as e:
            # Update record with error
            payout_record.status = "failed"
            payout_record.error_message = str(e)
            payout_record.updated_at = datetime.utcnow()
        
        # Save updated record
        doc_ref = self.db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(payout_record.request_id)
        update_dict = payout_record.model_dump(exclude={"request_id"})
        doc_ref.set(update_dict, merge=True)
        
        return payout_record
    
    async def get_payout_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a payout request by ID.
        
        Args:
            request_id: Payout request identifier
            
        Returns:
            Payout request data or None
        """
        doc = self.db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            data["request_id"] = doc.id
            return data
        return None
    
    async def update_payout_status(
        self,
        request_id: str,
        status: str,
        transaction_hash: Optional[str] = None
    ) -> None:
        """
        Update the status of a payout request.
        
        Args:
            request_id: Payout request identifier
            status: New status (pending, submitted, confirmed, failed)
            transaction_hash: Optional transaction hash
        """
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if transaction_hash:
            update_data["transaction_hash"] = transaction_hash
        
        doc_ref = self.db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id)
        doc_ref.set(update_data, merge=True)


# Global instance
payout_service = PayoutService()
