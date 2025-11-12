"""Service layer for parent monitoring and control."""
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from google.cloud.firestore import Query

from src.config.firebase_config import db
from src.config.collection_names import collections
from src.domain.models import (
    ParentNarrativeSettings,
    KidProgressSummary,
    PayoutApprovalResponse
)
from src.services.payout_service import payout_service


class ParentService:
    """Service for parent-related operations."""
    
    async def verify_parent_kid_link(self, parent_id: str, kid_id: str) -> bool:
        """
        Verify that a parent is linked to a specific kid.
        
        Args:
            parent_id: Parent's user ID
            kid_id: Kid's user ID
            
        Returns:
            True if linked, False otherwise
        """
        try:
            # Query user_management service data for parent-kid relationships
            # In real implementation, this would call user_management service
            # For now, check Firestore users collection
            kid_doc = db.collection("users").document(kid_id).get()
            
            if not kid_doc.exists:
                return False
            
            kid_data = kid_doc.to_dict()
            linked_parents = kid_data.get("linked_parents", [])
            
            return parent_id in linked_parents
        except Exception as e:
            print(f"Error verifying parent-kid link: {str(e)}")
            return False
    
    async def get_kid_narrative_progress(self, kid_id: str) -> List[Dict]:
        """
        Get detailed narrative progress for a specific kid.
        
        Args:
            kid_id: Kid's user ID
            
        Returns:
            List of progress records with story metadata
        """
        try:
            # Get all progress records for the kid
            progress_query = (
                db.collection(collections.NARRATIVE_PROGRESS)
                .where("user_id", "==", kid_id)
                .order_by("last_updated", direction=Query.DESCENDING)
            )
            
            progress_list = []
            for doc in progress_query.stream():
                progress_data = doc.to_dict()
                progress_data["progress_id"] = doc.id
                
                # Enrich with story metadata
                story_id = progress_data.get("story_id")
                if story_id:
                    story_doc = db.collection(collections.NARRATIVE_STORIES).document(story_id).get()
                    if story_doc.exists:
                        story_data = story_doc.to_dict()
                        progress_data["story_title"] = story_data.get("title")
                        progress_data["story_description"] = story_data.get("description")
                        progress_data["story_tags"] = story_data.get("tags", [])
                
                # Calculate completion percentage
                completed = len(progress_data.get("completed_nodes", []))
                total = progress_data.get("total_nodes", 0)
                progress_data["completion_percent"] = (completed / total * 100) if total > 0 else 0
                
                progress_list.append(progress_data)
            
            return progress_list
        except Exception as e:
            print(f"Error getting kid narrative progress: {str(e)}")
            return []
    
    async def get_all_kids_progress_summary(self, parent_id: str) -> List[KidProgressSummary]:
        """
        Get progress summary for all kids linked to a parent.
        
        Args:
            parent_id: Parent's user ID
            
        Returns:
            List of progress summaries for each kid
        """
        try:
            # Get all kids linked to this parent
            # In real implementation, this would call user_management service
            parent_doc = db.collection("users").document(parent_id).get()
            if not parent_doc.exists:
                return []
            
            parent_data = parent_doc.to_dict()
            linked_kids = parent_data.get("linked_kids", [])
            
            summaries = []
            for kid_id in linked_kids:
                summary = await self._calculate_kid_summary(kid_id)
                summaries.append(summary)
            
            return summaries
        except Exception as e:
            print(f"Error getting all kids progress summary: {str(e)}")
            return []
    
    async def _calculate_kid_summary(self, kid_id: str) -> KidProgressSummary:
        """Calculate progress summary for a single kid."""
        try:
            # Get kid info
            kid_doc = db.collection("users").document(kid_id).get()
            kid_name = None
            if kid_doc.exists:
                kid_data = kid_doc.to_dict()
                kid_name = kid_data.get("display_name") or kid_data.get("username")
            
            # Get progress data
            progress_query = db.collection(collections.NARRATIVE_PROGRESS).where("user_id", "==", kid_id)
            
            stories_started = 0
            stories_completed = 0
            total_xp = 0
            last_activity = None
            current_stories = []
            
            for doc in progress_query.stream():
                progress_data = doc.to_dict()
                stories_started += 1
                
                if progress_data.get("status") == "completed":
                    stories_completed += 1
                else:
                    # Add to current stories
                    story_id = progress_data.get("story_id")
                    story_doc = db.collection(collections.NARRATIVE_STORIES).document(story_id).get()
                    if story_doc.exists:
                        story_data = story_doc.to_dict()
                        current_stories.append({
                            "story_id": story_id,
                            "title": story_data.get("title"),
                            "progress": len(progress_data.get("completed_nodes", [])),
                            "total": progress_data.get("total_nodes", 0)
                        })
                
                total_xp += progress_data.get("total_xp", 0)
                
                # Track latest activity
                last_updated = progress_data.get("last_updated")
                if last_updated:
                    if isinstance(last_updated, str):
                        last_updated = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
                    if not last_activity or last_updated > last_activity:
                        last_activity = last_updated
            
            # Get payout data
            payout_query = db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).where("user_id", "==", kid_id)
            
            total_payouts = 0
            total_amount = 0.0
            
            for doc in payout_query.stream():
                payout_data = doc.to_dict()
                if payout_data.get("status") in ["submitted", "confirmed"]:
                    total_payouts += 1
                    total_amount += payout_data.get("amount", 0.0)
            
            return KidProgressSummary(
                kid_id=kid_id,
                kid_name=kid_name,
                stories_started=stories_started,
                stories_completed=stories_completed,
                total_xp_earned=total_xp,
                total_payouts=total_payouts,
                total_payout_amount=total_amount,
                last_activity_at=last_activity,
                current_stories=current_stories
            )
        except Exception as e:
            print(f"Error calculating kid summary: {str(e)}")
            return KidProgressSummary(kid_id=kid_id)
    
    async def get_pending_payouts(self, parent_id: str, kid_id: Optional[str] = None) -> List[Dict]:
        """
        Get pending payout requests for linked kids.
        
        Args:
            parent_id: Parent's user ID
            kid_id: Optional filter by specific kid
            
        Returns:
            List of pending payout requests
        """
        try:
            if kid_id:
                # Get payouts for specific kid
                kids = [kid_id]
            else:
                # Get all linked kids
                parent_doc = db.collection("users").document(parent_id).get()
                if not parent_doc.exists:
                    return []
                parent_data = parent_doc.to_dict()
                kids = parent_data.get("linked_kids", [])
            
            pending_payouts = []
            for kid in kids:
                query = (
                    db.collection(collections.NARRATIVE_PAYOUT_REQUESTS)
                    .where("user_id", "==", kid)
                    .where("status", "==", "pending")
                    .order_by("created_at", direction=Query.DESCENDING)
                )
                
                for doc in query.stream():
                    payout_data = doc.to_dict()
                    payout_data["request_id"] = doc.id
                    
                    # Enrich with kid name
                    kid_doc = db.collection("users").document(kid).get()
                    if kid_doc.exists:
                        kid_data = kid_doc.to_dict()
                        payout_data["kid_name"] = kid_data.get("display_name") or kid_data.get("username")
                    
                    pending_payouts.append(payout_data)
            
            return pending_payouts
        except Exception as e:
            print(f"Error getting pending payouts: {str(e)}")
            return []
    
    async def get_payout_request(self, request_id: str) -> Optional[Dict]:
        """Get a payout request by ID."""
        try:
            doc = db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id).get()
            if doc.exists:
                data = doc.to_dict()
                data["request_id"] = doc.id
                return data
            return None
        except Exception as e:
            print(f"Error getting payout request: {str(e)}")
            return None
    
    async def approve_payout(self, request_id: str, parent_id: str) -> PayoutApprovalResponse:
        """
        Approve a payout request and initiate processing.
        
        Args:
            request_id: Payout request identifier
            parent_id: Parent approving the payout
            
        Returns:
            Approval response with status
        """
        try:
            # Update payout status to approved and process
            doc_ref = db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id)
            doc_ref.update({
                "status": "approved",
                "approved_by": parent_id,
                "approved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            # Get updated payout data
            payout_doc = doc_ref.get()
            payout_data = payout_doc.to_dict()
            payout_data["request_id"] = request_id
            
            # Process the payout through payout service
            from src.domain.models import PayoutRequestRecord
            payout_record = PayoutRequestRecord(**payout_data)
            processed = await payout_service.process_payout(payout_record)
            
            return PayoutApprovalResponse(
                request_id=request_id,
                status=processed.status,
                message="Payout approved and processing initiated",
                transaction_hash=processed.transaction_hash
            )
        except Exception as e:
            print(f"Error approving payout: {str(e)}")
            return PayoutApprovalResponse(
                request_id=request_id,
                status="error",
                message=f"Failed to approve payout: {str(e)}"
            )
    
    async def reject_payout(self, request_id: str, parent_id: str, reason: Optional[str] = None) -> PayoutApprovalResponse:
        """
        Reject a payout request.
        
        Args:
            request_id: Payout request identifier
            parent_id: Parent rejecting the payout
            reason: Optional rejection reason
            
        Returns:
            Rejection response
        """
        try:
            doc_ref = db.collection(collections.NARRATIVE_PAYOUT_REQUESTS).document(request_id)
            doc_ref.update({
                "status": "rejected",
                "rejected_by": parent_id,
                "rejected_at": datetime.utcnow(),
                "rejection_reason": reason,
                "updated_at": datetime.utcnow()
            })
            
            return PayoutApprovalResponse(
                request_id=request_id,
                status="rejected",
                message=f"Payout rejected{': ' + reason if reason else ''}"
            )
        except Exception as e:
            print(f"Error rejecting payout: {str(e)}")
            return PayoutApprovalResponse(
                request_id=request_id,
                status="error",
                message=f"Failed to reject payout: {str(e)}"
            )
    
    async def get_narrative_settings(self, kid_id: str) -> ParentNarrativeSettings:
        """
        Get narrative settings for a kid.
        
        Args:
            kid_id: Kid's user ID
            
        Returns:
            Narrative settings (creates default if none exist)
        """
        try:
            doc = db.collection(collections.NARRATIVE_SETTINGS).document(kid_id).get()
            
            if doc.exists:
                settings_data = doc.to_dict()
                return ParentNarrativeSettings(**settings_data)
            else:
                # Return default settings
                return ParentNarrativeSettings(kid_id=kid_id)
        except Exception as e:
            print(f"Error getting narrative settings: {str(e)}")
            return ParentNarrativeSettings(kid_id=kid_id)
    
    async def update_narrative_settings(
        self, 
        kid_id: str, 
        settings: ParentNarrativeSettings,
        parent_id: str
    ) -> ParentNarrativeSettings:
        """
        Update narrative settings for a kid.
        
        Args:
            kid_id: Kid's user ID
            settings: New settings
            parent_id: Parent making the update
            
        Returns:
            Updated settings
        """
        try:
            settings.kid_id = kid_id  # Ensure kid_id matches
            settings.updated_at = datetime.utcnow()
            settings.updated_by = parent_id
            
            doc_ref = db.collection(collections.NARRATIVE_SETTINGS).document(kid_id)
            doc_ref.set(settings.dict(), merge=True)
            
            return settings
        except Exception as e:
            print(f"Error updating narrative settings: {str(e)}")
            raise
    
    async def get_narrative_analytics(self, kid_id: str, days: int = 30) -> Dict:
        """
        Get narrative learning analytics for a kid.
        
        Args:
            kid_id: Kid's user ID
            days: Number of days to analyze
            
        Returns:
            Analytics data including trends and metrics
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Get progress records within date range
            progress_query = (
                db.collection(collections.NARRATIVE_PROGRESS)
                .where("user_id", "==", kid_id)
                .where("last_updated", ">=", cutoff_date)
            )
            
            # Aggregate metrics
            total_xp = 0
            stories_completed = 0
            nodes_completed = 0
            topic_counts = {}
            daily_activity = {}
            
            for doc in progress_query.stream():
                progress_data = doc.to_dict()
                
                total_xp += progress_data.get("total_xp", 0)
                nodes_completed += len(progress_data.get("completed_nodes", []))
                
                if progress_data.get("status") == "completed":
                    stories_completed += 1
                
                # Track topics
                for topic in progress_data.get("preferred_topics", []):
                    topic_counts[topic] = topic_counts.get(topic, 0) + 1
                
                # Track daily activity
                last_updated = progress_data.get("last_updated")
                if last_updated:
                    if isinstance(last_updated, str):
                        last_updated = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
                    date_key = last_updated.strftime("%Y-%m-%d")
                    daily_activity[date_key] = daily_activity.get(date_key, 0) + 1
            
            # Get payout history
            payout_query = (
                db.collection(collections.NARRATIVE_PAYOUT_REQUESTS)
                .where("user_id", "==", kid_id)
                .where("created_at", ">=", cutoff_date)
            )
            
            total_earned = 0.0
            payout_count = 0
            
            for doc in payout_query.stream():
                payout_data = doc.to_dict()
                if payout_data.get("status") in ["submitted", "confirmed"]:
                    total_earned += payout_data.get("amount", 0.0)
                    payout_count += 1
            
            # Calculate velocity (XP per day)
            xp_per_day = total_xp / days if days > 0 else 0
            
            return {
                "period_days": days,
                "total_xp_earned": total_xp,
                "stories_completed": stories_completed,
                "nodes_completed": nodes_completed,
                "xp_per_day": round(xp_per_day, 2),
                "total_payouts": payout_count,
                "total_earned": total_earned,
                "topic_preferences": topic_counts,
                "daily_activity": daily_activity,
                "engagement_score": self._calculate_engagement_score(daily_activity, days)
            }
        except Exception as e:
            print(f"Error getting narrative analytics: {str(e)}")
            return {
                "period_days": days,
                "error": str(e)
            }
    
    def _calculate_engagement_score(self, daily_activity: Dict, total_days: int) -> float:
        """Calculate engagement score (0-100) based on activity."""
        active_days = len(daily_activity)
        if total_days == 0:
            return 0.0
        
        # Score based on percentage of active days
        base_score = (active_days / total_days) * 100
        
        # Bonus for consistency (multiple activities per day)
        avg_activities = sum(daily_activity.values()) / active_days if active_days > 0 else 0
        consistency_bonus = min(avg_activities * 5, 20)  # Max 20 bonus points
        
        return min(base_score + consistency_bonus, 100.0)


# Singleton instance
parent_service = ParentService()
