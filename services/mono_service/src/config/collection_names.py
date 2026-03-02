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
