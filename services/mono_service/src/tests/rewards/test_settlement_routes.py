"""Settlement endpoint: auth, idempotency, and the pending -> settled promotion.

This endpoint turns a promise into money the child actually has, and it is
reachable only by another service. Both halves need holding down: the auth
check, and the effect on the ledger.
"""
import importlib
import sys
import types

import pytest
from fastapi import HTTPException

from src.tests.users.fake_firestore import FakeFirestore, FieldFilter


PARENT = "parent_1"
CHILD = "child_1"
TASK_ID = "task_1"
TOKEN = "s3cret-internal-token"


class _Req:
    def __init__(self, headers=None):
        self.headers = headers or {}


@pytest.fixture
def internal(monkeypatch):
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

    import src.storage.firestore_db as task_db
    task_db = importlib.reload(task_db)
    monkeypatch.setattr(task_db, "db", fake_db)

    import src.routes.internal.internal_routes as internal_routes
    internal_routes = importlib.reload(internal_routes)
    monkeypatch.setattr(internal_routes, "task_db", task_db)
    monkeypatch.setattr(internal_routes, "reward_service", reward_service)

    from src.config.collection_names import collections
    fake_db.docs[f"{collections.TASKS}/{TASK_ID}"] = {
        "task_id": TASK_ID,
        "user_id": PARENT,
        "assigned_to_ids": [CHILD],
        "reward_amount": 7.0,
        "reward_currency": "XRP",
    }

    monkeypatch.setenv("INTERNAL_SERVICE_TOKEN", TOKEN)

    return types.SimpleNamespace(
        routes=internal_routes, service=reward_service, db=fake_db,
        collections=collections,
    )


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def test_a_call_without_the_internal_token_is_rejected(internal):
    from src.config.internal_auth import verify_internal_caller

    with pytest.raises(HTTPException) as exc:
        verify_internal_caller(_Req())
    assert exc.value.status_code == 403


def test_a_call_with_the_wrong_internal_token_is_rejected(internal):
    from src.config.internal_auth import verify_internal_caller

    with pytest.raises(HTTPException) as exc:
        verify_internal_caller(_Req({"X-Internal-Token": "wrong"}))
    assert exc.value.status_code == 403


def test_a_call_with_the_right_internal_token_passes(internal):
    from src.config.internal_auth import verify_internal_caller

    assert verify_internal_caller(_Req({"X-Internal-Token": TOKEN})) is None


def test_auth_fails_closed_when_no_token_is_configured(monkeypatch):
    """An unset secret must not turn an internal endpoint into an open one."""
    from src.config.internal_auth import verify_internal_caller

    monkeypatch.delenv("INTERNAL_SERVICE_TOKEN", raising=False)
    with pytest.raises(HTTPException) as exc:
        verify_internal_caller(_Req({"X-Internal-Token": "anything"}))
    assert exc.value.status_code == 401


# ---------------------------------------------------------------------------
# pending -> settled
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_settlement_promotes_a_pending_credit(internal):
    from src.domain.reward_models import RewardState
    from src.routes.internal.internal_routes import SettlementNotice

    task = internal.db.docs[f"{internal.collections.TASKS}/{TASK_ID}"]
    internal.service.credit_task(task, state=RewardState.PENDING)

    before = internal.service.get_rewards(CHILD)
    assert before["currencies"]["XRP"]["pending"] == 7.0
    assert before["token_score"] == 0.0

    result = await internal.routes.record_settlement(
        SettlementNotice(task_id=TASK_ID, tx_hash="DEADBEEF"),
        _Req({"X-Internal-Token": TOKEN}),
    )
    assert result["success"] is True
    assert result["credited"] == {CHILD: "created"}

    after = internal.service.get_rewards(CHILD)
    assert after["currencies"]["XRP"]["settled"] == 7.0
    assert after["currencies"]["XRP"]["pending"] == 0.0
    # Settled money is what counts toward score.
    assert after["token_score"] == 7.0


@pytest.mark.asyncio
async def test_a_replayed_webhook_does_not_credit_twice(internal):
    from src.routes.internal.internal_routes import SettlementNotice

    notice = SettlementNotice(task_id=TASK_ID, tx_hash="DEADBEEF")
    req = _Req({"X-Internal-Token": TOKEN})

    first = await internal.routes.record_settlement(notice, req)
    second = await internal.routes.record_settlement(notice, req)

    assert first["credited"] == {CHILD: "created"}
    assert second["credited"] == {CHILD: "duplicate"}
    assert internal.service.get_rewards(CHILD)["currencies"]["XRP"]["settled"] == 7.0


@pytest.mark.asyncio
async def test_settlement_can_arrive_without_a_prior_pending_credit(internal):
    """Webhook ordering is not guaranteed; settling directly must still work."""
    from src.routes.internal.internal_routes import SettlementNotice

    await internal.routes.record_settlement(
        SettlementNotice(task_id=TASK_ID), _Req({"X-Internal-Token": TOKEN})
    )
    projection = internal.service.get_rewards(CHILD)
    assert projection["currencies"]["XRP"]["settled"] == 7.0
    assert projection["tasks_settled"] == 1


@pytest.mark.asyncio
async def test_the_tx_hash_is_recorded_on_the_settled_event(internal):
    from src.routes.internal.internal_routes import SettlementNotice

    await internal.routes.record_settlement(
        SettlementNotice(task_id=TASK_ID, tx_hash="ABC123"),
        _Req({"X-Internal-Token": TOKEN}),
    )
    key = f"{internal.collections.REWARD_EVENTS}/{TASK_ID}:settled"
    assert internal.db.docs[key]["tx_hash"] == "ABC123"


@pytest.mark.asyncio
async def test_settling_an_unknown_task_is_a_404(internal):
    from src.routes.internal.internal_routes import SettlementNotice

    with pytest.raises(HTTPException) as exc:
        await internal.routes.record_settlement(
            SettlementNotice(task_id="nope"), _Req({"X-Internal-Token": TOKEN})
        )
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_the_caller_cannot_dictate_the_amount(internal):
    """The notice carries no amount: it is read from the task document, so a
    compromised caller cannot inflate a credit."""
    from src.routes.internal.internal_routes import SettlementNotice

    notice = SettlementNotice(task_id=TASK_ID)
    assert not hasattr(notice, "amount")
    assert not hasattr(notice, "currency")

    await internal.routes.record_settlement(notice, _Req({"X-Internal-Token": TOKEN}))
    assert internal.service.get_rewards(CHILD)["currencies"]["XRP"]["settled"] == 7.0
