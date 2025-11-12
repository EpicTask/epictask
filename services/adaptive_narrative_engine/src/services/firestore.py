"""Firestore database operations for stories and progress."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from google.cloud.firestore import Query

from src.config.firebase_config import db
from src.config.collection_names import collections
from src.domain.models import Story, StoryNode, StoryProgress


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
            query = query.where("published", "==", True)
        
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
        Create or update user's story progress.
        
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
        
        doc_ref.set(progress_dict, merge=True)
    
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


# Global instance
firestore_service = FirestoreService()
