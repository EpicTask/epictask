"""Storage for the append-only reward ledger and its projection.

Write path:  append_reward_event() -> rebuild_projection()
Read path:   get_projection()

"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set

from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..config.collection_names import collections
from ..config.firebase_config import db
from ..domain.reward_models import (
    PENDING_EXPIRY_DAYS,
    CurrencyTotals,
    RewardEvent,
    RewardProjection,
    RewardSource,
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
    # Settled beats voided, deliberately.
    #
    # The expiry job and a late settlement can race: a parent who signs just as
    # the credit expires produces both a VOIDED and a SETTLED event for the same
    # source. The money did move, so honouring the void would delete earnings
    # the child genuinely has.
    voided_sources = {
        e.get("source_id")
        for e in events
        if e.get("state") == RewardState.VOIDED.value
    } - settled_sources

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


# ---------------------------------------------------------------------------
# Scheduled maintenance
# ---------------------------------------------------------------------------

def expire_pending_credits(older_than_days: int = PENDING_EXPIRY_DAYS) -> Dict[str, Any]:
    """Void pending credits that have sat unsettled past the window.

    Settlement requires the parent to sign in Xumm, and some never will — an
    unlinked wallet means they cannot. Without this, a child keeps a balance
    that will never arrive, which is a promise the app cannot keep.

    Voiding is itself an appended event, so the history stays intact: you can
    still see that a credit was granted and later expired.
    """
    cutoff = (datetime.now(timezone.utc) - timedelta(days=older_than_days)).isoformat()

    query = db.collection(collections.REWARD_EVENTS).where(
        filter=FieldFilter("state", "==", RewardState.PENDING.value)
    )

    voided: List[str] = []
    affected_users: Set[str] = set()

    for doc in query.stream():
        event = doc.to_dict() or {}
        created_at = event.get("created_at")
        if not created_at or created_at >= cutoff:
            continue

        source_id = event.get("source_id")
        user_id = event.get("user_id")
        if not source_id or not user_id:
            continue

        # Already settled: nothing to expire, and voiding it would delete real
        # earnings. Also covers the case where settlement landed after the
        # pending credit was written.
        settled_id = RewardEvent.make_id(source_id, RewardState.SETTLED)
        if db.collection(collections.REWARD_EVENTS).document(settled_id).get().exists:
            continue

        void_event = RewardEvent(
            event_id=RewardEvent.make_id(source_id, RewardState.VOIDED),
            user_id=user_id,
            source=RewardSource(event.get("source", RewardSource.TASK.value)),
            source_id=source_id,
            state=RewardState.VOIDED,
            amount=float(event.get("amount") or 0.0),
            currency=event.get("currency") or "ETASK",
        )
        # Bypasses the projection rebuild per event; rebuilt once per user below.
        void_ref = db.collection(collections.REWARD_EVENTS).document(
            void_event.event_id
        )
        if void_ref.get().exists:
            continue

        payload = void_event.model_dump(mode="json")
        payload["created_at"] = _now()
        void_ref.set(payload)

        voided.append(void_event.event_id)
        affected_users.add(user_id)

    for user_id in affected_users:
        rebuild_projection(user_id)

    return {
        "cutoff": cutoff,
        "voided_count": len(voided),
        "voided": voided,
        "users_rebuilt": sorted(affected_users),
    }


def recompute_global_ranks() -> Dict[str, Any]:
    """Write `global_rank` onto every projection, ordered by settled score.

    Reads fall back to a live `token_score >` count when this has not run for a
    user yet, so rank is always correct; this job exists to make the common case
    a single document read instead of a query whose cost grows with how far down
    the ranking the user sits.
    """
    query = db.collection(collections.LEADERBOARD).order_by(
        "token_score", direction=firestore.Query.DESCENDING
    )

    ranked = 0
    for position, doc in enumerate(query.stream(), start=1):
        doc.reference.update({"global_rank": position, "ranked_at": _now()})
        ranked += 1

    return {"ranked_count": ranked}
