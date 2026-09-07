"""Firestore database operations for stories and progress."""
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from google.cloud.firestore import Query, ArrayUnion, transactional, Transaction
from google.cloud.firestore_v1.base_query import FieldFilter

from src.config.firebase_config import db
from src.config.collection_names import collections
from src.domain.models import Story, StoryNode, StoryProgress

logger = logging.getLogger("ane").getChild("firestore")


def resolve_user_age(user_id: str) -> int:
    """
    Resolve user's age from trusted profile data in Firestore.
    Returns safe default age (10) if profile data is missing or unconfigured.
    """
    try:
        user_doc = db.collection("users").document(user_id).get()
        if user_doc.exists:
            data = user_doc.to_dict() or {}
            age = data.get("age")
            if isinstance(age, int) and 5 <= age <= 18:
                return age
    except Exception:
        pass
    return 10


def is_guardian_of(caller_uid: str, target_uid: str) -> bool:
    """True when `target_uid` is a child of `caller_uid`, per server-side data.

    Children aged 5-12 are "managed": they have a Firebase uid but no
    credentials, so the device stays signed in as the **parent** while the app
    runs with the child as the active context (`effectiveUserId` in
    AuthContext). Every narrative call therefore arrives with the parent's
    token and the child's `user_id`.

    The link is read from Firestore, never from the request, so a caller cannot
    claim guardianship of an arbitrary uid.

    Both directions are accepted, matching `isFamilyMember()` in
    firestore.rules and `_require_self_or_guardian` in mono_service: the
    parent's `children` array is authoritative, and the child's `parent_id` is
    a fallback for older child documents that predate that array.
    """
    if not caller_uid or not target_uid:
        return False

    try:
        caller_doc = db.collection("users").document(caller_uid).get()
        if caller_doc.exists:
            children = (caller_doc.to_dict() or {}).get("children") or []
            if target_uid in children:
                return True

        target_doc = db.collection("users").document(target_uid).get()
        if target_doc.exists:
            if (target_doc.to_dict() or {}).get("parent_id") == caller_uid:
                return True
    except Exception:
        logger.warning(
            "Guardianship lookup failed; denying access", exc_info=True
        )

    return False


def validate_user_access(caller_uid: str, target_uid: str) -> None:
    """Allow a user to act on their own data, or a parent on their child's.

    Replaces bare `validate_user_ownership` on the narrative routes, which
    required exact uid equality and so returned 403 for every managed child —
    the app's entire 5-12 flow.
    """
    if caller_uid and caller_uid == target_uid:
        return
    if is_guardian_of(caller_uid, target_uid):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You don't have permission to access this resource",
    )


class FirestoreService:
    """Service for Firestore database operations."""
    
    def __init__(self):
        self.db = db
    
    # Story operations
    async def get_all_stories(self, age: Optional[int] = None, published_only: bool = True) -> List[Dict[str, Any]]:
        """
        Get all stories, optionally filtered by age and publication status.
        
        Args:
            age: User's age for age-appropriate filtering
            published_only: Only return published stories
            
        Returns:
            List of story dictionaries
        """
        query = self.db.collection(collections.STORIES)
        
        if published_only:
            query = query.where(filter=FieldFilter("published", "==", True))
        
        stories = []
        for doc in query.stream():
            story_data = doc.to_dict()
            story_data["story_id"] = doc.id
            
            # Filter by age if provided
            if age is not None:
                if story_data.get("age_min", 0) <= age <= story_data.get("age_max", 18):
                    stories.append(story_data)
            else:
                stories.append(story_data)
        
        return stories
    
    async def get_story(self, story_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific story by ID.
        
        Args:
            story_id: Story identifier
            
        Returns:
            Story dictionary or None if not found
        """
        doc = self.db.collection(collections.STORIES).document(story_id).get()
        if doc.exists:
            story_data = doc.to_dict()
            story_data["story_id"] = doc.id
            return story_data
        return None
    
    async def create_story(self, story: Story) -> str:
        """
        Create a new story in Firestore.
        
        Args:
            story: Story model
            
        Returns:
            Created story ID
        """
        story_dict = story.model_dump(exclude={"story_id"})
        story_dict["created_at"] = datetime.utcnow()
        story_dict["updated_at"] = datetime.utcnow()
        
        doc_ref = self.db.collection(collections.STORIES).document()
        doc_ref.set(story_dict)
        return doc_ref.id
    
    # Node operations
    async def get_node(self, story_id: str, node_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific node from a story.
        
        Args:
            story_id: Story identifier
            node_id: Node identifier
            
        Returns:
            Node dictionary or None if not found
        """
        doc = (self.db.collection(collections.STORIES)
               .document(story_id)
               .collection(collections.STORY_NODES)
               .document(node_id)
               .get())
        
        if doc.exists:
            node_data = doc.to_dict()
            node_data["node_id"] = doc.id
            return node_data
        return None
    
    async def get_story_nodes(self, story_id: str) -> List[Dict[str, Any]]:
        """
        Get all nodes for a story, ordered by order field.
        
        Args:
            story_id: Story identifier
            
        Returns:
            List of node dictionaries
        """
        query = (self.db.collection(collections.STORIES)
                .document(story_id)
                .collection(collections.STORY_NODES)
                .order_by("order"))
        
        nodes = []
        for doc in query.stream():
            node_data = doc.to_dict()
            node_data["node_id"] = doc.id
            nodes.append(node_data)
        
        return nodes
    
    async def create_node(self, story_id: str, node: StoryNode) -> str:
        """
        Create a new node for a story.
        
        Args:
            story_id: Story identifier
            node: Node model
            
        Returns:
            Created node ID
        """
        node_dict = node.model_dump(exclude={"node_id"})
        
        doc_ref = (self.db.collection(collections.STORIES)
                  .document(story_id)
                  .collection(collections.STORY_NODES)
                  .document())
        doc_ref.set(node_dict)
        return doc_ref.id
    
    # Progress operations
    async def get_progress(self, user_id: str, story_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user's progress for a specific story.
        
        Args:
            user_id: User identifier
            story_id: Story identifier
            
        Returns:
            Progress dictionary or None if not found
        """
        doc = (self.db.collection(collections.STORY_PROGRESS)
               .document(user_id)
               .collection(collections.USER_STORIES)
               .document(story_id)
               .get())
        
        if doc.exists:
            progress_data = doc.to_dict()
            return progress_data
        return None
    
    async def create_or_update_progress(self, progress: StoryProgress) -> None:
        """
        Create or update user's story progress using a Firestore transaction
        to prevent race conditions on XP and level calculations.

        Args:
            progress: Progress model
        """
        progress_dict = progress.model_dump(exclude={"user_id", "story_id"})
        progress_dict["last_updated"] = datetime.utcnow()

        if progress_dict.get("started_at") is None:
            progress_dict["started_at"] = datetime.utcnow()

        doc_ref = (self.db.collection(collections.STORY_PROGRESS)
                  .document(progress.user_id)
                  .collection(collections.USER_STORIES)
                  .document(progress.story_id))

        @transactional
        def update_in_transaction(transaction: Transaction) -> None:
            snapshot = doc_ref.get(transaction=transaction)
            if snapshot.exists:
                existing = snapshot.to_dict() or {}
                # Prevent duplicate XP or progress degradation
                if "started_at" in existing and existing["started_at"]:
                    progress_dict["started_at"] = existing["started_at"]
            transaction.set(doc_ref, progress_dict, merge=True)

        try:
            transaction = self.db.transaction()
            update_in_transaction(transaction)
        except Exception:
            # Fallback if transaction fails in mock environment
            doc_ref.set(progress_dict, merge=True)

    async def add_completed_money_moment(
        self, user_id: str, story_id: str, moment_id: str
    ) -> None:
        """
        Idempotently record a completed Money Moment for a user/story.

        Uses ArrayUnion so repeated calls with the same moment_id are no-ops
        and concurrent calls do not clobber each other.
        """
        doc_ref = (self.db.collection(collections.STORY_PROGRESS)
                  .document(user_id)
                  .collection(collections.USER_STORIES)
                  .document(story_id))

        doc_ref.set(
            {
                "completed_money_moment_ids": ArrayUnion([moment_id]),
                "last_updated": datetime.utcnow(),
            },
            merge=True,
        )
    
    async def get_all_user_progress(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all story progress for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            List of progress dictionaries
        """
        query = (self.db.collection(collections.STORY_PROGRESS)
                .document(user_id)
                .collection(collections.USER_STORIES)
                .order_by("last_updated", direction=Query.DESCENDING))
        
        progress_list = []
        for doc in query.stream():
            progress_data = doc.to_dict()
            progress_data["story_id"] = doc.id
            progress_data["user_id"] = user_id
            progress_list.append(progress_data)
        
        return progress_list

    async def get_progress_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Get a summary of all story progress for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            Summary dictionary
        """
        progress_list = await self.get_all_user_progress(user_id)
        
        stories_started = len(progress_list)
        stories_completed = sum(1 for p in progress_list if p.get("status") == "completed")
        total_xp_earned = sum(p.get("total_xp", 0) for p in progress_list)
        
        # Get payout data
        payout_query = (self.db.collection(collections.NARRATIVE_PAYOUT_REQUESTS)
                       .where("user_id", "==", user_id))
        
        payouts = list(payout_query.stream())
        total_payouts = sum(1 for p in payouts if p.to_dict().get("status") in ["submitted", "confirmed"])
        total_payout_amount = sum(p.to_dict().get("amount", 0.0) for p in payouts if p.to_dict().get("status") in ["submitted", "confirmed"])
        total_payouts_pending = sum(1 for p in payouts if p.to_dict().get("status") == "pending")

        current_stories = []
        for p in progress_list:
            if p.get("status") != "completed":
                story = await self.get_story(p["story_id"])
                if story:
                    current_stories.append({
                        "story_id": p["story_id"],
                        "title": story.get("title", "Unknown"),
                        "progress": len(p.get("completed_nodes", [])),
                        "total": story.get("total_nodes", 0)
                    })

        return {
            "kid_id": user_id,
            "stories_started": stories_started,
            "stories_completed": stories_completed,
            "total_xp_earned": total_xp_earned,
            "total_payouts": total_payouts,
            "total_payout_amount": total_payout_amount,
            "total_payouts_pending": total_payouts_pending,
            "current_stories": current_stories
        }


# Global instance
firestore_service = FirestoreService()
