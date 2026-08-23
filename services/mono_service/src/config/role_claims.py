"""
Keep each user's role in their Firebase custom claims.

A role that rides inside the ID token costs nothing to read: the backend has
already verified the token's signature, so `current_user["role"]` is free.
Reading the role out of Firestore instead means a document read on every
authorization check.

Claims are written server-side only, so unlike a Firestore field a client
cannot promote itself. They are also stale-by-design: `set_custom_user_claims`
lands on the user's *next* ID token, and tokens live an hour. Callers must
therefore keep a Firestore fallback for the propagation window, which is what
the `_get_caller_role` / `_require_parent` helpers do.
"""

import logging
import threading
import time
from typing import Optional

from firebase_admin import auth

logger = logging.getLogger(__name__)

_CLAIM_TTL_SECONDS = 3600

_recent_syncs: dict = {}
_lock = threading.Lock()


def _mark_synced(uid: str, role: str) -> bool:
    """Record a sync. Returns True if this uid/role was already synced recently."""
    now = time.monotonic()
    with _lock:
        cached = _recent_syncs.get(uid)
        if cached and cached[0] == role and (now - cached[1]) < _CLAIM_TTL_SECONDS:
            return True
        _recent_syncs[uid] = (role, now)
        return False


def reset_cache() -> None:
    """Drop the per-process sync cache. For tests."""
    with _lock:
        _recent_syncs.clear()


def set_role_claim(uid: str, role: str) -> None:
    """
    Write the role claim for a user the service has just created.

    Safe to call without reading existing claims first: a freshly created Auth
    user has none.
    """
    if not uid or not role:
        return
    try:
        auth.set_custom_user_claims(uid, {"role": role})
        _mark_synced(uid, role)
    except Exception:
        # Never fail account creation over a claim. The request-path fallback
        # in the route helpers repairs it on the user's first call.
        logger.warning("Could not set role claim for %s", uid, exc_info=True)


def sync_role_claim(uid: str, role: Optional[str]) -> None:
    """
    Repair a missing/stale role claim for an existing user.

    Called from the Firestore fallback path, so that a user whose account was
    created before claims existed - or created directly by the client - starts
    carrying their role in the token from their next refresh onwards.
    """
    if not uid or not role:
        return
    if _mark_synced(uid, role):
        return
    try:
        user = auth.get_user(uid)
        existing = user.custom_claims or {}
        if existing.get("role") == role:
            return
        auth.set_custom_user_claims(uid, {**existing, "role": role})
        logger.info("Backfilled role claim for %s: %s", uid, role)
    except Exception:
        logger.warning("Could not sync role claim for %s", uid, exc_info=True)
