"""Credit-path coverage for the reward ledger.
"""
import importlib
import sys
import types

import pytest

from src.tests.users.fake_firestore import FakeFirestore, FieldFilter


PARENT = "parent_1"
CHILD = "child_1"
SIBLING = "child_2"


def _task(task_id="task_1", assignees=None, amount=5.0, currency="XRP"):
    return {
        "task_id": task_id,
        "user_id": PARENT,
        "assigned_to_ids": assignees if assignees is not None else [CHILD],
        "task_title": "Take out the bins",
        "reward_amount": amount,
        "reward_currency": currency,
        "payment_method": "Pay Directly",
    }


@pytest.fixture
def rewards(monkeypatch):
    """reward_db + reward_service bound to an in-memory Firestore."""
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

    from src.config.collection_names import collections
    return types.SimpleNamespace(
        db=fake_db, reward_db=reward_db, service=reward_service, collections=collections
    )


def _events(rewards):
    prefix = rewards.collections.REWARD_EVENTS + "/"
    return {k: v for k, v in rewards.db.docs.items() if k.startswith(prefix)}


# ---------------------------------------------------------------------------
# The credit actually lands — the assertion that was missing entirely
# ---------------------------------------------------------------------------

def test_approving_a_task_credits_the_assignee(rewards):
    from src.domain.reward_models import RewardState

    result = rewards.service.credit_task(_task(), state=RewardState.PENDING)
    assert result == {CHILD: "created"}

    projection = rewards.service.get_rewards(CHILD)
    assert projection["user_id"] == CHILD
    assert projection["currencies"]["XRP"]["pending"] == 5.0
    assert projection["currencies"]["XRP"]["settled"] == 0.0
    assert projection["tasks_pending"] == 1
    assert projection["tasks_settled"] == 0


def test_credit_is_written_at_a_deterministic_id(rewards):
    rewards.service.credit_task(_task(task_id="task_42"))
    assert list(_events(rewards)) == [
        f"{rewards.collections.REWARD_EVENTS}/task_42:pending"
    ]


def test_credits_land_in_the_test_prefixed_collection(rewards):
    """Collection policy: everything is test-prefixed except `users`."""
    rewards.service.credit_task(_task())
    assert rewards.collections.REWARD_EVENTS == "test_reward_events"
    assert all(k.startswith("test_reward_events/") for k in _events(rewards))


# ---------------------------------------------------------------------------
# Idempotency — verification and payment are both retryable
# ---------------------------------------------------------------------------

def test_crediting_the_same_task_twice_does_not_double_count(rewards):
    task = _task()
    assert rewards.service.credit_task(task) == {CHILD: "created"}
    assert rewards.service.credit_task(task) == {CHILD: "duplicate"}

    assert len(_events(rewards)) == 1
    projection = rewards.service.get_rewards(CHILD)
    assert projection["currencies"]["XRP"]["pending"] == 5.0
    assert projection["tasks_pending"] == 1


def test_a_repriced_replay_cannot_inflate_the_credit(rewards):
    """A second call at a higher amount must not overwrite the first credit."""
    rewards.service.credit_task(_task(amount=5.0))
    rewards.service.credit_task(_task(amount=9999.0))

    projection = rewards.service.get_rewards(CHILD)
    assert projection["currencies"]["XRP"]["pending"] == 5.0


# ---------------------------------------------------------------------------
# pending -> settled
# ---------------------------------------------------------------------------

def test_settling_supersedes_the_pending_credit(rewards):
    from src.domain.reward_models import RewardState

    task = _task()
    rewards.service.credit_task(task, state=RewardState.PENDING)
    rewards.service.credit_task(task, state=RewardState.SETTLED, tx_hash="ABC123")

    projection = rewards.service.get_rewards(CHILD)
    # Counted once, as settled — not once pending plus once settled.
    assert projection["currencies"]["XRP"]["settled"] == 5.0
    assert projection["currencies"]["XRP"]["pending"] == 0.0
    assert projection["tasks_settled"] == 1
    assert projection["tasks_pending"] == 0


def test_voiding_removes_the_credit_entirely(rewards):
    from src.domain.reward_models import RewardState

    task = _task()
    rewards.service.credit_task(task, state=RewardState.PENDING)
    rewards.service.credit_task(task, state=RewardState.VOIDED)

    projection = rewards.service.get_rewards(CHILD)
    assert projection["currencies"].get("XRP", {"pending": 0}).get("pending", 0) == 0.0
    assert projection["tasks_pending"] == 0
    assert projection["token_score"] == 0.0


# ---------------------------------------------------------------------------
# Scoring: only settled money counts, and level/progress agree
# ---------------------------------------------------------------------------

def test_pending_money_does_not_raise_score_or_level(rewards):
    from src.domain.reward_models import RewardState

    rewards.service.credit_task(
        _task(amount=4000.0, currency="ETASK"), state=RewardState.PENDING
    )
    projection = rewards.service.get_rewards(CHILD)
    assert projection["token_score"] == 0.0
    assert projection["level"] == 1


def test_level_and_progress_are_derived_from_the_same_score(rewards):
    """Regression: level used to mix score and task count while progress used
    score alone, which pinned the progress bar at 0 forever."""
    from src.domain.reward_models import RewardState

    rewards.service.credit_task(
        _task(amount=2500.0, currency="ETASK"), state=RewardState.SETTLED
    )
    projection = rewards.service.get_rewards(CHILD)
    # 2500 eTask at the corrected 0.01 weight.
    assert projection["token_score"] == 25.0
    assert projection["level"] == 3
    assert projection["level_progress"] == 50.0


def test_many_settled_tasks_alone_cannot_desync_progress(rewards):
    from src.domain.reward_models import RewardState

    for i in range(60):
        rewards.service.credit_task(
            _task(task_id=f"task_{i}", amount=1.0, currency="ETASK"),
            state=RewardState.SETTLED,
        )
    projection = rewards.service.get_rewards(CHILD)
    assert projection["tasks_settled"] == 60
    # 60 eTask at the corrected 0.01 weight.
    assert projection["token_score"] == 0.6
    assert projection["level"] == 1
    assert projection["level_progress"] == 6.0


def test_xrp_is_weighted_per_the_documented_constant(rewards):
    from src.domain.reward_models import CURRENCY_WEIGHTS, RewardState

    rewards.service.credit_task(
        _task(amount=100.0, currency="XRP"), state=RewardState.SETTLED
    )
    projection = rewards.service.get_rewards(CHILD)
    assert projection["token_score"] == round(100.0 * CURRENCY_WEIGHTS["XRP"], 2)


def test_multiple_currencies_accumulate_separately(rewards):
    from src.domain.reward_models import RewardState

    rewards.service.credit_task(
        _task(task_id="t1", amount=2.0, currency="XRP"), state=RewardState.SETTLED
    )
    rewards.service.credit_task(
        _task(task_id="t2", amount=7.0, currency="RLUSD"), state=RewardState.SETTLED
    )
    projection = rewards.service.get_rewards(CHILD)
    assert projection["currencies"]["XRP"]["settled"] == 2.0
    assert projection["currencies"]["RLUSD"]["settled"] == 7.0


# ---------------------------------------------------------------------------
# Multi-assignee and isolation
# ---------------------------------------------------------------------------

def test_multi_assignee_task_credits_each_child_once(rewards):
    result = rewards.service.credit_task(_task(assignees=[CHILD, SIBLING]))
    assert result == {CHILD: "created", SIBLING: "created"}

    for uid in (CHILD, SIBLING):
        assert rewards.service.get_rewards(uid)["currencies"]["XRP"]["pending"] == 5.0


def test_one_childs_credits_do_not_leak_into_a_siblings_projection(rewards):
    rewards.service.credit_task(_task(assignees=[CHILD]))
    sibling = rewards.service.get_rewards(SIBLING)
    assert sibling["token_score"] == 0.0
    assert sibling["currencies"] == {}


# ---------------------------------------------------------------------------
# Failures surface; they are never swallowed
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("missing", ["assigned_to_ids", "reward_currency", "reward_amount"])
def test_an_uncreditable_task_raises_rather_than_warning(rewards, missing):
    from src.services.rewards.reward_service import RewardCreditError

    task = _task()
    task[missing] = None
    with pytest.raises(RewardCreditError):
        rewards.service.credit_task(task)
    assert _events(rewards) == {}


def test_an_unknown_currency_is_rejected(rewards):
    with pytest.raises(ValueError):
        rewards.service.credit_task(_task(currency="DOGE"))
    assert _events(rewards) == {}


# ---------------------------------------------------------------------------
# The projection is derived, not authoritative
# ---------------------------------------------------------------------------

def test_projection_can_be_rebuilt_after_being_destroyed(rewards):
    from src.domain.reward_models import RewardState

    rewards.service.credit_task(
        _task(amount=12.0, currency="RLUSD"), state=RewardState.SETTLED
    )
    key = f"{rewards.collections.LEADERBOARD}/{CHILD}"
    del rewards.db.docs[key]
    assert rewards.service.get_rewards(CHILD)["token_score"] == 0.0

    rebuilt = rewards.service.rebuild(CHILD)
    assert rebuilt["currencies"]["RLUSD"]["settled"] == 12.0
    assert rebuilt["token_score"] == 12.0


def test_a_user_with_no_credits_reads_as_zero_not_missing(rewards):
    projection = rewards.service.get_rewards("nobody")
    assert projection["token_score"] == 0.0
    assert projection["level"] == 1
    assert projection["tasks_settled"] == 0
