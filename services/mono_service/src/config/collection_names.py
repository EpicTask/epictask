"""Firestore collection names for the Unified Monorepo Service."""

# Deliberate: every collection is test-prefixed, in all environments.
#  `users` is the sole exception and is declared unprefixed below.

_prefix = "test_"


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

    LEADERBOARD = f"{_prefix}leaderboard"

    # Append-only reward ledger. Record of truth for earnings; LEADERBOARD is a
    # projection derived from it. See domain/reward_models.py.
    REWARD_EVENTS = f"{_prefix}reward_events"

    # DELIBERATELY UNPREFIXED, unlike everything else here.
    #
    # This collection is owned and written by adaptive_narrative_engine, which
    # uses unprefixed names throughout (see its own collection_names.py). We
    # only read it, so the name has to match the writer — not our prefix policy.
    # Adding `test_` here would silently read an empty collection and make story
    # earnings vanish again.
    NARRATIVE_PAYOUT_REQUESTS = "narrative_payout_requests"

    # Smart Contract / XRPL related (Legacy/Integration)
    CONTRACTS = f"{_prefix}contracts"
    INTERACTIONS = f"{_prefix}interactions"
    XRPL_SERVICE = f"{_prefix}xrpl_service"
    XUMM_CALLBACKS = f"{_prefix}xumm_callbacks"


# Global instance
collections = Collections()
