"""Firestore collection names for the Unified Monorepo Service."""
import os

_prefix = "test_" if os.getenv("ENV", "development") != "production" else "test_"


class Collections:
    """Firestore collection name constants."""

    # ---------------------------------------------------------
    # SHARED / CORE
    # ---------------------------------------------------------
    USERS = "users"
    USER_SETTINGS = "settings"  # subcollection of users
    PREFERENCES = "preferences"
    USER_EVENTS = f"{_prefix}user_events"

    # Server-only subcollection of users. Holds PIN hashes and lockout state.
    # Firestore rules deny all client access to this path — it is reachable
    # only through the Admin SDK.
    USER_PRIVATE = "private"
    USER_SECURITY_DOC = "security"

    # ---------------------------------------------------------
    # USER MANAGEMENT
    # ---------------------------------------------------------
    INVITES = f"{_prefix}invites"
    # Parent-issued, single-use invites that create a teen (13+) account.
    CHILD_INVITES = f"{_prefix}child_invites"
    NOTIFICATIONS = f"{_prefix}notifications"

    # ---------------------------------------------------------
    # TASK MANAGEMENT
    # ---------------------------------------------------------
    TASKS = f"{_prefix}tasks"
    TASK_EVENTS = f"{_prefix}task_events"
    TASK_COMMENTS = f"{_prefix}task_comments"
    PAID_TASKS = f"{_prefix}paid_tasks"
    REWARDS = f"{_prefix}rewards"

    LEADERBOARD = f"{_prefix}leaderboard"

    # Smart Contract / XRPL related (Legacy/Integration)
    CONTRACTS = f"{_prefix}contracts"
    INTERACTIONS = f"{_prefix}interactions"
    XRPL_SERVICE = f"{_prefix}xrpl_service"
    XUMM_CALLBACKS = f"{_prefix}xumm_callbacks"


# Global instance
collections = Collections()
