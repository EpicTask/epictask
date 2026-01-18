"""Firestore collection names for the Unified Monorepo Service."""


class Collections:
    """Firestore collection name constants."""
    
    # ---------------------------------------------------------
    # SHARED / CORE
    # ---------------------------------------------------------
    USERS = "users"
    USER_SETTINGS = "settings"  # subcollection of users
    USER_EVENTS = "user_events"
    
    # ---------------------------------------------------------
    # USER MANAGEMENT
    # ---------------------------------------------------------
    INVITES = "invites"
    
    # ---------------------------------------------------------
    # NARRATIVE ENGINE
    # ---------------------------------------------------------
    STORIES = "stories"
    NARRATIVE_STORIES = "stories"  
    STORY_NODES = "nodes"  # subcollection of stories
    
    STORY_PROGRESS = "story_progress"
    NARRATIVE_PROGRESS = "story_progress"  
    USER_STORIES = "stories"  # subcollection of story_progress/{userId}
    
    NARRATIVE_AWARDS = "narrative_awards"
    NARRATIVE_PAYOUT_REQUESTS = "narrative_payout_requests"
    NARRATIVE_SETTINGS = "narrative_settings"  # Parent settings per kid
    NARRATIVE_EVENTS = "narrative_events"
    
    # ---------------------------------------------------------
    # TASK MANAGEMENT
    # ---------------------------------------------------------
    TASKS = "tasks"
    TASK_EVENTS = "task_events"
    TASK_COMMENTS = "task_comments"
    PAID_TASKS = "paid_tasks"
    REWARDS = "rewards"
    
    LEADERBOARD = "leaderboard"
    
    # Smart Contract / XRPL related (Legacy/Integration)
    CONTRACTS = "contracts"
    INTERACTIONS = "interactions"
    XRPL_SERVICE = "xrpl_service"
    XUMM_CALLBACKS = "xumm_callbacks"


# Global instance
collections = Collections()
