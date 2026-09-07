"""Storage for the append-only reward ledger and its projection.

Write path:  append_reward_event() -> rebuild_projection()
Read path:   get_projection()

"""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from google.cloud.firestore_v1.base_query import FieldFilter

from ..config.collection_names import collections
from ..config.firebase_config import db
from ..domain.reward_models import (
    CurrencyTotals,
    RewardEvent,
    RewardProjection,
    RewardState,
    level_for,
    level_progress_for,
    token_score,
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def append_reward_event(event: RewardEvent) -> str:
    """Append one credit, then refresh the projection.

    Returns "created" on a new credit, or "duplicate" when an event already
    exists at this deterministic ID — the retry case, which is a success from
    the caller's point of view, not an error.

    Two racing callers could both observe "not exists" and both write. Because
    the ID is deterministic they write the *same* document, and because the
    projection sums events rather than incrementing, the outcome is identical
    to a single write.
    """
    doc_ref = db.collection(collections.REWARD_EVENTS).document(event.event_id)

    if doc_ref.get().exists:
        return "duplicate"

    payload = event.model_dump(mode="json")
    payload["created_at"] = payload.get("created_at") or _now()
    doc_ref.set(payload)

    rebuild_projection(event.user_id)
    return "created"


def get_user_events(user_id: str) -> List[Dict[str, Any]]:
    """Every reward event for one user. Bounded by that user's own history."""
    query = db.collection(collections.REWARD_EVENTS).where(
        filter=FieldFilter("user_id", "==", user_id)
    )
    return [doc.to_dict() for doc in query.stream()]


def rebuild_projection(user_id: str) -> Dict[str, Any]:
    """Recompute and persist the projection for one user from their events."""
    events = get_user_events(user_id)

    currencies: Dict[str, CurrencyTotals] = {}
    tasks_settled = 0
    tasks_pending = 0

    # A source whose credit has settled must not also count as pending.
    settled_sources = {
        e.get("source_id")
        for e in events
        if e.get("state") == RewardState.SETTLED.value
    }
    voided_sources = {
        e.get("source_id")
        for e in events
        if e.get("state") == RewardState.VOIDED.value
    }

    for event in events:
        state = event.get("state")
        source_id = event.get("source_id")
        code = (event.get("currency") or "").upper()
        amount = float(event.get("amount") or 0.0)

        if state == RewardState.VOIDED.value or source_id in voided_sources:
            continue

        bucket = currencies.setdefault(code, CurrencyTotals())

        if state == RewardState.SETTLED.value:
            bucket.settled += amount
            tasks_settled += 1
        elif state == RewardState.PENDING.value:
            # Superseded by a settled credit for the same source.
            if source_id in settled_sources:
                continue
            bucket.pending += amount
            tasks_pending += 1

    for totals in currencies.values():
        totals.pending = round(totals.pending, 6)
        totals.settled = round(totals.settled, 6)

    score = token_score(currencies)
    projection = RewardProjection(
        user_id=user_id,
        currencies=currencies,
        tasks_settled=tasks_settled,
        tasks_pending=tasks_pending,
        token_score=score,
        level=level_for(score),
        level_progress=level_progress_for(score),
        updated_at=_now(),
    )

    payload = projection.model_dump(mode="json")
    # Full overwrite, not merge: the projection is derived, so stale keys from a
    # previous shape must not survive a rebuild.
    db.collection(collections.LEADERBOARD).document(user_id).set(payload)
    return payload


def get_projection(user_id: str) -> Dict[str, Any]:
    """The projection for one user, or a zeroed one if they have no credits."""
    snapshot = db.collection(collections.LEADERBOARD).document(user_id).get()
    if snapshot.exists:
        return snapshot.to_dict()
    return RewardProjection(user_id=user_id).model_dump(mode="json")
