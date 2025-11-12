"""Firestore collection names for Adaptive Narrative Engine."""


class Collections:
    """Firestore collection name constants."""
    
    # Story collections
    STORIES = "stories"
    NARRATIVE_STORIES = "stories"  
    STORY_NODES = "nodes"  # subcollection of stories
    
    # User progress
    STORY_PROGRESS = "story_progress"
    NARRATIVE_PROGRESS = "story_progress"  
    USER_STORIES = "stories"  # subcollection of story_progress/{userId}
    
    # Awards and achievements
    NARRATIVE_AWARDS = "narrative_awards"
    
    # Payout tracking
    NARRATIVE_PAYOUT_REQUESTS = "narrative_payout_requests"
    
    # User settings
    USERS = "users"
    USER_SETTINGS = "settings"  # subcollection
    NARRATIVE_SETTINGS = "narrative_settings"  # Parent settings per kid
    
    # Analytics (for future use)
    NARRATIVE_EVENTS = "narrative_events"


# Global instance
collections = Collections()
