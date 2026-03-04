"""Firestore collection names for the Unified Monorepo Service."""


class Collections:
    """Firestore collection name constants for testing."""
    
    # ---------------------------------------------------------
    # SHARED / CORE
    # ---------------------------------------------------------
    USERS = "users"
    USER_SETTINGS = "settings"  # subcollection of users
    USER_EVENTS = "test_user_events"
    
    # ---------------------------------------------------------
    # USER MANAGEMENT
    # ---------------------------------------------------------
    INVITES = "test_invites"
    NOTIFICATIONS = "test_notifications"
    
    # ---------------------------------------------------------
    # TASK MANAGEMENT
    # ---------------------------------------------------------
    TASKS = "test_tasks"
    TASK_EVENTS = "test_task_events"
    TASK_COMMENTS = "test_task_comments"
    PAID_TASKS = "test_paid_tasks"
    REWARDS = "test_rewards"
    
    LEADERBOARD = "test_leaderboard"
    
    # Smart Contract / XRPL related (Legacy/Integration)
    CONTRACTS = "test_contracts"
    INTERACTIONS = "test_interactions"
    XRPL_SERVICE = "test_xrpl_service"
    XUMM_CALLBACKS = "test_xumm_callbacks"


# Global instance
collections = Collections()
