"""Pub/Sub publisher for narrative events."""
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
from google.cloud import pubsub_v1
import uuid


class PubSubPublisher:
    """Publisher for narrative events to Google Cloud Pub/Sub."""
    
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.publisher = pubsub_v1.PublisherClient()
        
        # Topic names
        self.topics = {
            "progress": f"projects/{self.project_id}/topics/narrative.events.progressed.v1",
            "completed": f"projects/{self.project_id}/topics/narrative.events.completed.v1",
            "payout_requested": f"projects/{self.project_id}/topics/narrative.payout.requested.v1",
            "payout_confirmed": f"projects/{self.project_id}/topics/narrative.payout.confirmed.v1",
            "payout_approved": f"projects/{self.project_id}/topics/narrative.payout.approved.v1",
            "payout_rejected": f"projects/{self.project_id}/topics/narrative.payout.rejected.v1",
            "settings_updated": f"projects/{self.project_id}/topics/narrative.settings.updated.v1",
        }
    
    def _create_event_base(self, user_id: str) -> Dict[str, Any]:
        """Create base event structure with common fields."""
        return {
            "event_id": str(uuid.uuid4()),
            "occurred_at": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "service": "adaptive-narrative-engine",
            "version": "0.1.0"
        }
    
    async def publish_progress_event(
        self,
        user_id: str,
        story_id: str,
        from_node: str,
        to_node: str,
        xp_awarded: int,
        age: int,
        correlation_id: Optional[str] = None
    ) -> str:
        """
        Publish a story progress event.
        
        Args:
            user_id: User identifier
            story_id: Story identifier
            from_node: Previous node ID
            to_node: New node ID
            xp_awarded: XP points awarded
            age: User's age
            correlation_id: Optional correlation ID
            
        Returns:
            Message ID from Pub/Sub
        """
        event = self._create_event_base(user_id)
        event.update({
            "story_id": story_id,
            "from_node": from_node,
            "to_node": to_node,
            "xp_awarded": xp_awarded,
            "age": age,
            "correlation_id": correlation_id or str(uuid.uuid4())
        })
        
        return await self._publish(self.topics["progress"], event)
    
    async def publish_story_completed_event(
        self,
        user_id: str,
        story_id: str,
        final_node: str,
        total_xp: int,
        completion_time_seconds: Optional[int] = None
    ) -> str:
        """
        Publish a story completion event.
        
        Args:
            user_id: User identifier
            story_id: Story identifier
            final_node: Terminal node reached
            total_xp: Total XP earned in story
            completion_time_seconds: Time taken to complete
            
        Returns:
            Message ID from Pub/Sub
        """
        event = self._create_event_base(user_id)
        event.update({
            "story_id": story_id,
            "final_node": final_node,
            "total_xp": total_xp,
            "completion_time_seconds": completion_time_seconds
        })
        
        return await self._publish(self.topics["completed"], event)
    
    async def publish_payout_requested_event(
        self,
        user_id: str,
        request_id: str,
        wallet_address: str,
        token: str,
        amount: float,
        reason: str,
        story_id: Optional[str] = None,
        node_id: Optional[str] = None,
        correlation_id: Optional[str] = None
    ) -> str:
        """
        Publish a payout request event.
        
        Args:
            user_id: User identifier
            request_id: Payout request ID
            wallet_address: Destination wallet
            token: Token type (eTask, RLUSD, XRP)
            amount: Payout amount
            reason: Reason for payout
            story_id: Optional story ID
            node_id: Optional node ID
            correlation_id: Optional correlation ID
            
        Returns:
            Message ID from Pub/Sub
        """
        event = self._create_event_base(user_id)
        event.update({
            "request_id": request_id,
            "wallet_address": wallet_address,
            "token": token,
            "amount": amount,
            "reason": reason,
            "story_id": story_id,
            "node_id": node_id,
            "correlation_id": correlation_id or str(uuid.uuid4())
        })
        
        return await self._publish(self.topics["payout_requested"], event)
    
    async def publish_payout_confirmed_event(
        self,
        user_id: str,
        request_id: str,
        transaction_hash: str,
        amount: float,
        token: str,
        correlation_id: Optional[str] = None
    ) -> str:
        """
        Publish a payout confirmation event.
        
        Args:
            user_id: User identifier
            request_id: Payout request ID
            transaction_hash: Blockchain transaction hash
            amount: Payout amount
            token: Token type
            correlation_id: Optional correlation ID
            
        Returns:
            Message ID from Pub/Sub
        """
        event = self._create_event_base(user_id)
        event.update({
            "request_id": request_id,
            "transaction_hash": transaction_hash,
            "amount": amount,
            "token": token,
            "correlation_id": correlation_id or str(uuid.uuid4())
        })
        
        return await self._publish(self.topics["payout_confirmed"], event)
    
    async def publish_payout_approved_event(
        self,
        request_id: str,
        parent_id: str,
        kid_id: str,
        amount: float,
        wallet_address: str
    ) -> str:
        """
        Publish a payout approval event by parent.
        
        Args:
            request_id: Payout request ID
            parent_id: Parent who approved
            kid_id: Kid receiving the payout
            amount: Payout amount
            wallet_address: Destination wallet
            
        Returns:
            Message ID from Pub/Sub
        """
        event = self._create_event_base(kid_id)
        event.update({
            "request_id": request_id,
            "parent_id": parent_id,
            "kid_id": kid_id,
            "amount": amount,
            "wallet_address": wallet_address,
            "action": "approved"
        })
        
        return await self._publish(self.topics["payout_approved"], event)
    
    async def publish_payout_rejected_event(
        self,
        request_id: str,
        parent_id: str,
        kid_id: str,
        reason: Optional[str] = None
    ) -> str:
        """
        Publish a payout rejection event by parent.
        
        Args:
            request_id: Payout request ID
            parent_id: Parent who rejected
            kid_id: Kid whose payout was rejected
            reason: Optional rejection reason
            
        Returns:
            Message ID from Pub/Sub
        """
        event = self._create_event_base(kid_id)
        event.update({
            "request_id": request_id,
            "parent_id": parent_id,
            "kid_id": kid_id,
            "reason": reason,
            "action": "rejected"
        })
        
        return await self._publish(self.topics["payout_rejected"], event)
    
    async def publish_settings_updated_event(
        self,
        parent_id: str,
        kid_id: str,
        settings: Dict[str, Any]
    ) -> str:
        """
        Publish a narrative settings update event.
        
        Args:
            parent_id: Parent who updated settings
            kid_id: Kid whose settings were updated
            settings: Updated settings data
            
        Returns:
            Message ID from Pub/Sub
        """
        event = self._create_event_base(parent_id)
        event.update({
            "parent_id": parent_id,
            "kid_id": kid_id,
            "settings": settings,
            "action": "settings_updated"
        })
        
        return await self._publish(self.topics["settings_updated"], event)
    
    async def _publish(self, topic_path: str, event_data: Dict[str, Any]) -> str:
        """
        Publish an event to a Pub/Sub topic.
        
        Args:
            topic_path: Full topic path
            event_data: Event data dictionary
            
        Returns:
            Message ID from Pub/Sub
        """
        try:
            # Convert event to JSON bytes
            message_data = json.dumps(event_data).encode("utf-8")
            
            # Publish message
            future = self.publisher.publish(topic_path, message_data)
            message_id = future.result()  # Wait for publish to complete
            
            print(f"Published event {event_data['event_id']} to {topic_path}: {message_id}")
            return message_id
            
        except Exception as e:
            # Log error but don't fail the request
            print(f"Error publishing to Pub/Sub: {str(e)}")
            print(f"Event data: {event_data}")
            # Re-raise in development, swallow in production
            if os.getenv("ENV") == "development":
                raise
            return None


# Global instance
pubsub_publisher = PubSubPublisher()
