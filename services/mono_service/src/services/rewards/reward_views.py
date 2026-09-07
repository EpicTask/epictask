"""Read side of the reward domain.

Every view here is built from the per-user projection, which is one document
read. The implementation this replaces recomputed each user's score from raw
fields in Python and scanned the *entire* leaderboard collection once per user,
so a parent with three children cost four full-collection reads per screen.

Scoring shown here is settled-only, with pending carried alongside: a child is
never told they own money the parent has not yet signed for.
"""
from typing import Any, Dict, List, Optional

from google.cloud.firestore_v1.base_query import FieldFilter

from ...config.collection_names import collections
from ...config.firebase_config import db
from ...domain.reward_models import CURRENCY_WEIGHTS, LEVEL_STEP
from ...domain.task_models import (
    ComprehensiveRewards,
    FamilyLeaderboard,
    KidLeaderboardView,
)
from ...storage import reward_db


def _display_name(user_id: str) -> str:
    """Name from the user profile, which is the source of truth for it."""
    snapshot = db.collection(collections.USERS).document(user_id).get()
    if not snapshot.exists:
        return ""
    data = snapshot.to_dict() or {}
    return data.get("displayName") or data.get("display_name") or ""


def _global_rank(user_id: str, score: float) -> int:
    """Rank by counting only users who score higher.

    One filtered query rather than a scan of every leaderboard document. Ranking
    is on `token_score` alone; the previous code ranked by a
    `score*0.7 + tasks*0.3` composite in one place and by raw `token_score` in
    another, so the rank a child saw disagreed with their row in the parent's
    list by construction.
    """
    higher = db.collection(collections.LEADERBOARD).where(
        filter=FieldFilter("token_score", ">", score)
    )
    return sum(1 for _ in higher.stream()) + 1


def calculate_achievements(
    xrp: float, rlusd: float, etask: float, tasks_completed: int, level: int
) -> List[str]:
    """Achievements from settled earnings.

    Names are unchanged: the kid view picks icons by substring ('First',
    'Master', 'Champion', 'Legend', 'Star', 'Earner'), so renaming these
    silently changes the UI.
    """
    achievements: List[str] = []

    if tasks_completed >= 1:
        achievements.append("First Task Completed")
    if tasks_completed >= 10:
        achievements.append("Task Master")
    if tasks_completed >= 50:
        achievements.append("Task Champion")
    if tasks_completed >= 100:
        achievements.append("Task Legend")

    # Uses the shared currency weights rather than its own normalisation, so
    # score and achievements can no longer drift apart.
    total = (
        xrp * CURRENCY_WEIGHTS["XRP"]
        + rlusd * CURRENCY_WEIGHTS["RLUSD"]
        + etask * CURRENCY_WEIGHTS["ETASK"]
    )
    if total >= 1:
        achievements.append("First Earnings")
    if total >= 10:
        achievements.append("Token Collector")
    if total >= 50:
        achievements.append("Token Master")
    if total >= 100:
        achievements.append("Token Legend")

    if xrp >= 1:
        achievements.append("XRP Earner")
    if xrp >= 10:
        achievements.append("XRP Collector")
    if rlusd >= 1:
        achievements.append("RLUSD Earner")
    if rlusd >= 10:
        achievements.append("RLUSD Collector")
    if etask >= 100:
        achievements.append("eTask Earner")
    if etask >= 1000:
        achievements.append("eTask Collector")

    if level >= 5:
        achievements.append("Rising Star")
    if level >= 10:
        achievements.append("Expert Level")
    if level >= 20:
        achievements.append("Master Level")

    return achievements


def _settled(projection: Dict[str, Any], code: str) -> float:
    return float((projection.get("currencies", {}).get(code) or {}).get("settled", 0.0))


def _pending(projection: Dict[str, Any], code: str) -> float:
    return float((projection.get("currencies", {}).get(code) or {}).get("pending", 0.0))


def get_comprehensive_rewards(
    user_id: str, with_global_rank: bool = True
) -> ComprehensiveRewards:
    """One user's rewards, from one projection read."""
    projection = reward_db.get_projection(user_id)

    xrp = _settled(projection, "XRP")
    rlusd = _settled(projection, "RLUSD")
    etask = _settled(projection, "ETASK")
    score = float(projection.get("token_score", 0.0))
    level = int(projection.get("level", 1))
    tasks_settled = int(projection.get("tasks_settled", 0))

    return ComprehensiveRewards(
        user_id=user_id,
        display_name=_display_name(user_id),
        currencies={
            # Settled — what the child actually owns.
            "xrp_earned": xrp,
            "rlusd_earned": rlusd,
            "etask_earned": etask,
            # Approved but not yet signed for. New keys; existing readers ignore
            # them until the reward views surface pending state.
            "xrp_pending": _pending(projection, "XRP"),
            "rlusd_pending": _pending(projection, "RLUSD"),
            "etask_pending": _pending(projection, "ETASK"),
        },
        tasks_completed=tasks_settled,
        tasks_pending=int(projection.get("tasks_pending", 0)),
        level=level,
        family_rank=0,  # assigned by the family view, which knows the siblings
        global_rank=_global_rank(user_id, score) if with_global_rank else 0,
        token_score=score,
        achievements=calculate_achievements(xrp, rlusd, etask, tasks_settled, level),
        next_level_progress=float(projection.get("level_progress", 0.0)),
    )


def get_family_leaderboard(parent_id: str) -> FamilyLeaderboard:
    """Parent view: one projection read per child."""
    parent_snapshot = db.collection(collections.USERS).document(parent_id).get()
    child_ids = (
        (parent_snapshot.to_dict() or {}).get("children", [])
        if parent_snapshot.exists
        else []
    )

    children = [get_comprehensive_rewards(child_id) for child_id in child_ids]

    # Single ordering, matching the global one.
    children.sort(key=lambda c: c.token_score, reverse=True)
    for position, child in enumerate(children, start=1):
        child.family_rank = position

    return FamilyLeaderboard(
        family_id=parent_id,
        parent_id=parent_id,
        children=children,
        family_total_tokens=round(sum(c.token_score for c in children), 2),
        family_total_tasks=sum(c.tasks_completed for c in children),
        # 0 means unranked, and is honest. The previous value was
        # `max(1, int(family_total_tokens / 100))`, which inverted the scale —
        # a family with nothing ranked #1 and a high-earning family ranked #100.
        # A real family ranking needs a family-level aggregate that does not
        # exist yet; building it is a Phase 6 item.
        family_global_rank=0,
    )


def _find_parent_id(kid_id: str) -> Optional[str]:
    query = (
        db.collection(collections.USERS)
        .where(filter=FieldFilter("children", "array_contains", kid_id))
        .limit(1)
    )
    for doc in query.stream():
        return doc.id
    return None


ENCOURAGEMENT = [
    "Amazing work! You're crushing those tasks! \U0001F31F",
    "Keep it up, superstar! Every task makes you stronger! \U0001F4AA",
    "You're on fire! Your hard work is paying off! \U0001F525",
    "Fantastic job! You're building great habits! \U0001F3AF",
    "Way to go! You're earning your way to success! \U0001F3C6",
]


def get_kid_leaderboard_view(kid_id: str) -> KidLeaderboardView:
    """Child view: their own projection plus where they sit in the family."""
    kid = get_comprehensive_rewards(kid_id)

    parent_id = _find_parent_id(kid_id)
    family_position = 0
    family_total_kids = 0

    if parent_id:
        family = get_family_leaderboard(parent_id)
        family_total_kids = len(family.children)
        for child in family.children:
            if child.user_id == kid_id:
                family_position = child.family_rank
                kid.family_rank = child.family_rank
                break

    # A rank is not an achievement. Ranking is a total order, so a child who
    # has done nothing still sorts somewhere — and when every sibling has zero,
    # someone sorts first. The previous version congratulated that child for
    # being "#1 in your family", praise for work they had not done. Activity is
    # therefore checked before any podium claim, not after.
    has_activity = kid.tasks_completed > 0 or kid.tasks_pending > 0

    if not has_activity:
        encouragement = "Complete your first task to start earning! \U0001F680"
    elif family_position == 1 and family_total_kids > 1:
        encouragement = f"\U0001F947 You're #1 in your family! {ENCOURAGEMENT[0]}"
    elif 1 < family_position <= 3:
        encouragement = f"\U0001F949 You're in the top 3! {ENCOURAGEMENT[1]}"
    else:
        encouragement = ENCOURAGEMENT[family_position % len(ENCOURAGEMENT)]

    return KidLeaderboardView(
        kid_data=kid,
        family_position=family_position,
        family_total_kids=family_total_kids,
        encouragement_message=encouragement,
        next_milestone={
            "type": "level",
            "current": kid.level,
            "next": kid.level + 1,
            "progress": kid.next_level_progress,
            # Points still needed, so the view can say something concrete.
            "points_to_next": round(
                max(0.0, kid.level * LEVEL_STEP - kid.token_score), 2
            ),
        },
        global_context={
            "rank": kid.global_rank,
            "message": f"You're ranked #{kid.global_rank} among all kids!",
        },
    )


def get_global_leaderboard(limit: int = 100) -> Dict[str, Any]:
    """Top users by settled score, straight off the projection."""
    from firebase_admin import firestore as _firestore

    query = (
        db.collection(collections.LEADERBOARD)
        .order_by("token_score", direction=_firestore.Query.DESCENDING)
        .limit(limit)
    )

    entries: List[Dict[str, Any]] = []
    for position, doc in enumerate(query.stream(), start=1):
        data = doc.to_dict() or {}
        entries.append(
            {
                "user_id": doc.id,
                "display_name": _display_name(doc.id),
                "tasks_completed": int(data.get("tasks_settled", 0)),
                "xrp_earned": _settled(data, "XRP"),
                "rlusd_earned": _settled(data, "RLUSD"),
                "etask_earned": _settled(data, "ETASK"),
                "token_score": float(data.get("token_score", 0.0)),
                "level": int(data.get("level", 1)),
                # Real rank, so it cannot disagree with what the child is shown.
                "rank": position,
                "last_updated": data.get("updated_at"),
            }
        )

    return {"leaderboard": entries, "total_entries": len(entries)}
