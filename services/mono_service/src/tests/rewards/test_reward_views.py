"""Read-side coverage for the reward views.

Locks in the four scoring/ranking defects the previous implementation had, so a
future change has to break a test to reintroduce them:

  * `family_global_rank` was inverted — a family with nothing ranked #1
  * `next_level_progress` was pinned at 0 by a level earned in another unit
  * rank used two different formulas in two places
  * a child with no completed tasks was told "You're #1 in your family!"
"""
import importlib
import sys
import types

import pytest

from src.tests.users.fake_firestore import FakeFirestore, FieldFilter


PARENT = "parent_1"
KID_A = "child_a"
KID_B = "child_b"
OUTSIDER = "outsider_1"


@pytest.fixture
def views(monkeypatch):
    fake_db = FakeFirestore()
    stub_config = types.ModuleType("src.config.firebase_config")
    stub_config.db = fake_db
    sys.modules["src.config.firebase_config"] = stub_config

    import src.storage.reward_db as reward_db
    reward_db = importlib.reload(reward_db)
    monkeypatch.setattr(reward_db, "db", fake_db)
    monkeypatch.setattr(reward_db, "FieldFilter", FieldFilter)

    import src.services.rewards.reward_service as reward_service
    reward_service = importlib.reload(reward_service)
    monkeypatch.setattr(reward_service, "reward_db", reward_db)

    import src.services.rewards.reward_views as reward_views
    reward_views = importlib.reload(reward_views)
    monkeypatch.setattr(reward_views, "db", fake_db)
    monkeypatch.setattr(reward_views, "FieldFilter", FieldFilter)
    monkeypatch.setattr(reward_views, "reward_db", reward_db)

    fake_db.docs["users/" + PARENT] = {
        "uid": PARENT, "role": "parent", "children": [KID_A, KID_B],
        "displayName": "Sam",
    }
    fake_db.docs["users/" + KID_A] = {
        "uid": KID_A, "role": "child", "parent_id": PARENT, "displayName": "Ada",
    }
    fake_db.docs["users/" + KID_B] = {
        "uid": KID_B, "role": "child", "parent_id": PARENT, "displayName": "Jo",
    }

    return types.SimpleNamespace(
        db=fake_db, views=reward_views, service=reward_service
    )


def _credit(views, user_id, amount, currency="XRP", state=None, task_id=None):
    from src.domain.reward_models import RewardState
    task = {
        "task_id": task_id or f"t_{user_id}_{amount}_{currency}",
        "user_id": PARENT,
        "assigned_to_ids": [user_id],
        "reward_amount": amount,
        "reward_currency": currency,
    }
    views.service.credit_task(task, state=state or RewardState.SETTLED)


# ---------------------------------------------------------------------------
# Comprehensive rewards
# ---------------------------------------------------------------------------

def test_settled_and_pending_are_reported_separately(views):
    from src.domain.reward_models import RewardState

    _credit(views, KID_A, 6.0, "XRP", RewardState.SETTLED, task_id="settled_1")
    _credit(views, KID_A, 4.0, "XRP", RewardState.PENDING, task_id="pending_1")

    rewards = views.views.get_comprehensive_rewards(KID_A)
    assert rewards.currencies["xrp_earned"] == 6.0
    assert rewards.currencies["xrp_pending"] == 4.0
    assert rewards.tasks_completed == 1
    assert rewards.tasks_pending == 1
    # Pending must not move the score.
    assert rewards.token_score == 6.0


def test_display_name_comes_from_the_user_profile(views):
    _credit(views, KID_A, 1.0)
    assert views.views.get_comprehensive_rewards(KID_A).display_name == "Ada"


def test_level_progress_tracks_the_same_score_as_level(views):
    """Regression: progress used to be clamped to 0 forever."""
    _credit(views, KID_A, 25.0, "XRP")
    rewards = views.views.get_comprehensive_rewards(KID_A)
    assert rewards.token_score == 25.0
    assert rewards.level == 3
    assert rewards.next_level_progress == 50.0


def test_xrp_is_no_longer_worth_less_than_etask(views):
    """Regression: XRP was weighted 0.3 while eTask was 1.0."""
    _credit(views, KID_A, 10.0, "XRP")
    _credit(views, KID_B, 10.0, "ETASK")
    a = views.views.get_comprehensive_rewards(KID_A)
    b = views.views.get_comprehensive_rewards(KID_B)
    assert a.token_score > b.token_score
    assert a.token_score == 10.0
    assert b.token_score == 0.1


def test_achievements_reflect_settled_earnings(views):
    _credit(views, KID_A, 12.0, "XRP")
    achievements = views.views.get_comprehensive_rewards(KID_A).achievements
    assert "First Task Completed" in achievements
    assert "XRP Earner" in achievements
    assert "XRP Collector" in achievements
    assert "Token Collector" in achievements


def test_pending_only_earnings_grant_no_achievements(views):
    from src.domain.reward_models import RewardState

    _credit(views, KID_A, 50.0, "XRP", RewardState.PENDING)
    assert views.views.get_comprehensive_rewards(KID_A).achievements == []


# ---------------------------------------------------------------------------
# Ranking
# ---------------------------------------------------------------------------

def test_global_rank_orders_by_settled_score(views):
    _credit(views, KID_A, 30.0, "XRP")
    _credit(views, KID_B, 10.0, "XRP")
    assert views.views.get_comprehensive_rewards(KID_A).global_rank == 1
    assert views.views.get_comprehensive_rewards(KID_B).global_rank == 2


def test_kid_and_parent_views_agree_on_rank(views):
    """Regression: the kid view ranked on a composite while the global list
    ordered on raw token_score, so the two disagreed by construction."""
    _credit(views, KID_A, 30.0, "XRP")
    _credit(views, KID_B, 10.0, "XRP")

    kid_view = views.views.get_kid_leaderboard_view(KID_B)
    global_list = views.views.get_global_leaderboard()
    row = next(e for e in global_list["leaderboard"] if e["user_id"] == KID_B)

    assert kid_view.global_context["rank"] == row["rank"]


def test_global_leaderboard_reports_real_names_and_ranks(views):
    _credit(views, KID_A, 5.0, "XRP")
    entries = views.views.get_global_leaderboard()["leaderboard"]
    assert entries[0]["display_name"] == "Ada"
    assert entries[0]["rank"] == 1


# ---------------------------------------------------------------------------
# Family view
# ---------------------------------------------------------------------------

def test_family_leaderboard_ranks_and_totals_children(views):
    _credit(views, KID_A, 8.0, "XRP")
    _credit(views, KID_B, 20.0, "XRP")

    family = views.views.get_family_leaderboard(PARENT)
    assert [c.user_id for c in family.children] == [KID_B, KID_A]
    assert [c.family_rank for c in family.children] == [1, 2]
    assert family.family_total_tokens == 28.0
    assert family.family_total_tasks == 2


def test_family_global_rank_is_not_inverted(views):
    """Regression: was `max(1, total/100)`, so a family with nothing got #1 and
    a high-earning family got a worse number the more it earned."""
    poor = views.views.get_family_leaderboard(PARENT)
    _credit(views, KID_A, 10000.0, "XRP")
    rich = views.views.get_family_leaderboard(PARENT)

    assert rich.family_total_tokens > poor.family_total_tokens
    # 0 == unranked, pending a real family aggregate. The point is that earning
    # more can never produce a numerically worse rank.
    assert poor.family_global_rank == 0
    assert rich.family_global_rank == 0


def test_family_leaderboard_of_a_parent_with_no_children_is_empty(views):
    views.db.docs["users/" + PARENT]["children"] = []
    family = views.views.get_family_leaderboard(PARENT)
    assert family.children == []
    assert family.family_total_tasks == 0


# ---------------------------------------------------------------------------
# Kid view messaging
# ---------------------------------------------------------------------------

def test_a_child_with_nothing_is_not_congratulated_for_being_first(views):
    """Regression: family_position defaulted to 1, so a child who had done
    nothing was told "You're #1 in your family!"."""
    view = views.views.get_kid_leaderboard_view(KID_A)
    assert "#1" not in view.encouragement_message
    assert "first task" in view.encouragement_message.lower()
    assert view.kid_data.tasks_completed == 0


def test_the_actual_family_leader_is_congratulated(views):
    _credit(views, KID_A, 40.0, "XRP")
    _credit(views, KID_B, 1.0, "XRP")
    view = views.views.get_kid_leaderboard_view(KID_A)
    assert "#1" in view.encouragement_message
    assert view.family_position == 1


def test_kid_with_no_parent_gets_no_family_claim(views):
    view = views.views.get_kid_leaderboard_view("orphan_kid")
    assert view.family_position == 0
    assert view.family_total_kids == 0
    assert "#1" not in view.encouragement_message


def test_next_milestone_reports_points_still_needed(views):
    _credit(views, KID_A, 12.0, "XRP")
    milestone = views.views.get_kid_leaderboard_view(KID_A).next_milestone
    assert milestone["current"] == 2
    assert milestone["next"] == 3
    assert milestone["points_to_next"] == 8.0
