"""Scheduled reward maintenance: pending expiry and rank recompute."""
import importlib
import sys
import types
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

from src.tests.users.fake_firestore import FakeFirestore, FieldFilter


PARENT = "parent_1"
KID_A = "child_a"
KID_B = "child_b"
TOKEN = "s3cret-internal-token"


class _Req:
    def __init__(self, headers=None):
        self.headers = headers if headers is not None else {"X-Internal-Token": TOKEN}

    async def json(self):
        return {}


@pytest.fixture
def jobs(monkeypatch):
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

    import src.routes.internal.internal_routes as internal_routes
    internal_routes = importlib.reload(internal_routes)
    monkeypatch.setattr(internal_routes, "db", fake_db)
    monkeypatch.setattr(internal_routes, "reward_service", reward_service)

    monkeypatch.setenv("INTERNAL_SERVICE_TOKEN", TOKEN)

    fake_db.docs[f"users/{KID_A}"] = {"uid": KID_A, "displayName": "Ada"}
    fake_db.docs[f"users/{KID_B}"] = {"uid": KID_B, "displayName": "Jo"}

    from src.config.collection_names import collections
    return types.SimpleNamespace(
        db=fake_db, reward_db=reward_db, service=reward_service,
        views=reward_views, routes=internal_routes, collections=collections,
    )


def _age(jobs, event_id, days):
    """Backdate an event's created_at."""
    key = f"{jobs.collections.REWARD_EVENTS}/{event_id}"
    when = datetime.now(timezone.utc) - timedelta(days=days)
    jobs.db.docs[key]["created_at"] = when.isoformat()


def _task(task_id="task_1", user=KID_A, amount=5.0, currency="XRP"):
    return {
        "task_id": task_id,
        "user_id": PARENT,
        "assigned_to_ids": [user],
        "reward_amount": amount,
        "reward_currency": currency,
    }


# ---------------------------------------------------------------------------
# Pending expiry
# ---------------------------------------------------------------------------

def test_a_credit_pending_past_the_window_is_voided(jobs):
    jobs.service.credit_task(_task())
    _age(jobs, "task_1:pending", days=4)

    assert jobs.service.get_rewards(KID_A)["currencies"]["XRP"]["pending"] == 5.0

    result = jobs.service.expire_pending()
    assert result["voided_count"] == 1

    projection = jobs.service.get_rewards(KID_A)
    assert projection["tasks_pending"] == 0
    assert projection["currencies"].get("XRP", {}).get("pending", 0.0) == 0.0


def test_a_credit_inside_the_window_is_left_alone(jobs):
    """The window is 3 days; 2 days old must survive."""
    jobs.service.credit_task(_task())
    _age(jobs, "task_1:pending", days=2)

    assert jobs.service.expire_pending()["voided_count"] == 0
    assert jobs.service.get_rewards(KID_A)["currencies"]["XRP"]["pending"] == 5.0


def test_the_window_is_three_days(jobs):
    from src.domain.reward_models import PENDING_EXPIRY_DAYS

    assert PENDING_EXPIRY_DAYS == 3


def test_expiry_keeps_the_history(jobs):
    """A void is appended, not a deletion — the grant is still visible."""
    jobs.service.credit_task(_task())
    _age(jobs, "task_1:pending", days=5)
    jobs.service.expire_pending()

    prefix = jobs.collections.REWARD_EVENTS + "/"
    ids = sorted(k[len(prefix):] for k in jobs.db.docs if k.startswith(prefix))
    assert ids == ["task_1:pending", "task_1:voided"]


def test_expiry_is_idempotent(jobs):
    jobs.service.credit_task(_task())
    _age(jobs, "task_1:pending", days=5)

    assert jobs.service.expire_pending()["voided_count"] == 1
    assert jobs.service.expire_pending()["voided_count"] == 0


def test_an_already_settled_credit_is_never_voided(jobs):
    from src.domain.reward_models import RewardState

    task = _task()
    jobs.service.credit_task(task, state=RewardState.PENDING)
    jobs.service.credit_task(task, state=RewardState.SETTLED)
    _age(jobs, "task_1:pending", days=10)

    assert jobs.service.expire_pending()["voided_count"] == 0
    assert jobs.service.get_rewards(KID_A)["currencies"]["XRP"]["settled"] == 5.0


def test_a_settlement_landing_after_expiry_still_counts(jobs):
    """The race that matters: the parent signs just as the credit expires.

    The money moved, so honouring the void would delete earnings the child
    genuinely has.
    """
    from src.domain.reward_models import RewardState

    task = _task()
    jobs.service.credit_task(task, state=RewardState.PENDING)
    _age(jobs, "task_1:pending", days=5)
    jobs.service.expire_pending()
    assert jobs.service.get_rewards(KID_A)["token_score"] == 0.0

    # Webhook arrives late.
    jobs.service.credit_task(task, state=RewardState.SETTLED)

    projection = jobs.service.get_rewards(KID_A)
    assert projection["currencies"]["XRP"]["settled"] == 5.0
    assert projection["token_score"] == 5.0


def test_expiry_only_touches_the_affected_child(jobs):
    jobs.service.credit_task(_task("task_1", user=KID_A))
    jobs.service.credit_task(_task("task_2", user=KID_B))
    _age(jobs, "task_1:pending", days=9)

    result = jobs.service.expire_pending()
    assert result["users_rebuilt"] == [KID_A]
    assert jobs.service.get_rewards(KID_B)["currencies"]["XRP"]["pending"] == 5.0


def test_expiry_covers_narrative_credits_too(jobs):
    payout = {
        "request_id": "payout_1",
        "user_id": KID_A,
        "token": "eTask",
        "amount": 500.0,
    }
    from src.domain.reward_models import RewardState

    jobs.service.credit_narrative_payout(payout, state=RewardState.PENDING)
    _age(jobs, "payout_1:pending", days=4)

    assert jobs.service.expire_pending()["voided_count"] == 1
    assert jobs.service.get_rewards(KID_A)["tasks_pending"] == 0


# ---------------------------------------------------------------------------
# Rank recompute
# ---------------------------------------------------------------------------

def test_recompute_stores_rank_in_score_order(jobs):
    from src.domain.reward_models import RewardState

    jobs.service.credit_task(_task("t1", KID_A, 30.0), state=RewardState.SETTLED)
    jobs.service.credit_task(_task("t2", KID_B, 10.0), state=RewardState.SETTLED)

    assert jobs.service.recompute_ranks()["ranked_count"] == 2
    assert jobs.db.docs[f"{jobs.collections.LEADERBOARD}/{KID_A}"]["global_rank"] == 1
    assert jobs.db.docs[f"{jobs.collections.LEADERBOARD}/{KID_B}"]["global_rank"] == 2


def test_reads_use_the_stored_rank_once_the_job_has_run(jobs):
    from src.domain.reward_models import RewardState

    jobs.service.credit_task(_task("t1", KID_A, 30.0), state=RewardState.SETTLED)
    jobs.service.credit_task(_task("t2", KID_B, 10.0), state=RewardState.SETTLED)
    jobs.service.recompute_ranks()

    assert jobs.views.get_comprehensive_rewards(KID_B).global_rank == 2


def test_rank_is_still_correct_before_the_job_ever_runs(jobs):
    """The live count is the invariant; the stored value is only a cache."""
    from src.domain.reward_models import RewardState

    jobs.service.credit_task(_task("t1", KID_A, 30.0), state=RewardState.SETTLED)
    jobs.service.credit_task(_task("t2", KID_B, 10.0), state=RewardState.SETTLED)

    assert jobs.views.get_comprehensive_rewards(KID_A).global_rank == 1
    assert jobs.views.get_comprehensive_rewards(KID_B).global_rank == 2


def test_a_newly_credited_child_gets_a_live_rank_between_job_runs(jobs):
    from src.domain.reward_models import RewardState

    jobs.service.credit_task(_task("t1", KID_A, 30.0), state=RewardState.SETTLED)
    jobs.service.recompute_ranks()
    # KID_B is credited after the job ran, so has no stored rank.
    jobs.service.credit_task(_task("t2", KID_B, 50.0), state=RewardState.SETTLED)

    assert jobs.views.get_comprehensive_rewards(KID_B).global_rank == 1


def test_recompute_is_safe_to_run_repeatedly(jobs):
    from src.domain.reward_models import RewardState

    jobs.service.credit_task(_task("t1", KID_A, 30.0), state=RewardState.SETTLED)
    first = jobs.service.recompute_ranks()
    second = jobs.service.recompute_ranks()
    assert first == second


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_the_job_endpoints_require_the_internal_token(jobs):
    with pytest.raises(HTTPException) as exc:
        from src.config.internal_auth import verify_internal_caller
        verify_internal_caller(_Req(headers={}))
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_expire_endpoint_runs_the_job(jobs):
    jobs.service.credit_task(_task())
    _age(jobs, "task_1:pending", days=4)

    result = await jobs.routes.run_expire_pending(_Req())
    assert result["success"] is True
    assert result["voided_count"] == 1


@pytest.mark.asyncio
async def test_rank_endpoint_runs_the_job(jobs):
    from src.domain.reward_models import RewardState

    jobs.service.credit_task(_task("t1", KID_A, 5.0), state=RewardState.SETTLED)
    result = await jobs.routes.run_recompute_ranks(_Req())
    assert result["success"] is True
    assert result["ranked_count"] == 1
