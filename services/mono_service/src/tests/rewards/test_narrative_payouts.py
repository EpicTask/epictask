"""Story payouts reaching the reward ledger.

The narrative engine has always published narrative.payout.confirmed.v1 and
nothing subscribed, so story earnings reached no balance. These tests hold the
subscriber down, and in particular hold down that the event payload is treated
as a pointer rather than as truth.
"""
import base64
import importlib
import json
import sys
import types

import pytest
from fastapi import HTTPException

from src.tests.users.fake_firestore import FakeFirestore, FieldFilter


KID = "child_1"
REQUEST_ID = "payout_1"
TOKEN = "s3cret-internal-token"


class _Req:
    """Stand-in for the Pub/Sub push request."""

    def __init__(self, event=None, headers=None, raw=None):
        self.headers = headers if headers is not None else {"X-Internal-Token": TOKEN}
        if raw is not None:
            self._body = raw
        elif event is None:
            self._body = {}
        else:
            encoded = base64.b64encode(json.dumps(event).encode()).decode()
            self._body = {"message": {"data": encoded}}

    async def json(self):
        return self._body


@pytest.fixture
def narrative(monkeypatch):
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

    import src.routes.internal.internal_routes as internal_routes
    internal_routes = importlib.reload(internal_routes)
    monkeypatch.setattr(internal_routes, "db", fake_db)
    monkeypatch.setattr(internal_routes, "reward_service", reward_service)

    monkeypatch.setenv("INTERNAL_SERVICE_TOKEN", TOKEN)

    from src.config.collection_names import collections
    return types.SimpleNamespace(
        routes=internal_routes, service=reward_service, db=fake_db,
        collections=collections,
    )


def _seed_payout(narrative, status="confirmed", amount=250.0, token="eTask"):
    narrative.db.docs[
        f"{narrative.collections.NARRATIVE_PAYOUT_REQUESTS}/{REQUEST_ID}"
    ] = {
        "request_id": REQUEST_ID,
        "user_id": KID,
        "wallet_address": "rKid",
        "token": token,
        "amount": amount,
        "reason": "story_complete",
        "story_id": "story_1",
        "status": status,
        "transaction_hash": "TXHASH1",
    }


def _event(request_id=REQUEST_ID, **overrides):
    event = {
        "event_id": "evt_1",
        "user_id": KID,
        "service": "adaptive-narrative-engine",
        "request_id": request_id,
        "transaction_hash": "TXHASH1",
        "amount": 250.0,
        "token": "eTask",
    }
    event.update(overrides)
    return event


# ---------------------------------------------------------------------------
# The gap this closes
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_a_confirmed_story_payout_credits_the_child(narrative):
    _seed_payout(narrative)
    result = await narrative.routes.handle_narrative_payout_confirmed(
        _Req(_event())
    )
    assert result["success"] is True

    projection = narrative.service.get_rewards(KID)
    # 250 eTask at the 0.01 weight.
    assert projection["currencies"]["ETASK"]["settled"] == 250.0
    assert projection["token_score"] == 2.5


@pytest.mark.asyncio
async def test_story_and_task_earnings_share_one_balance(narrative):
    """Both streams land in the same ledger, so the child sees one total."""
    from src.domain.reward_models import RewardState

    _seed_payout(narrative, amount=100.0, token="eTask")
    await narrative.routes.handle_narrative_payout_confirmed(_Req(_event()))

    narrative.service.credit_task(
        {
            "task_id": "task_1",
            "user_id": "parent_1",
            "assigned_to_ids": [KID],
            "reward_amount": 3.0,
            "reward_currency": "XRP",
        },
        state=RewardState.SETTLED,
    )

    projection = narrative.service.get_rewards(KID)
    assert projection["currencies"]["ETASK"]["settled"] == 100.0
    assert projection["currencies"]["XRP"]["settled"] == 3.0
    assert projection["tasks_settled"] == 2
    assert projection["token_score"] == 4.0


@pytest.mark.asyncio
async def test_the_transaction_hash_is_recorded(narrative):
    _seed_payout(narrative)
    await narrative.routes.handle_narrative_payout_confirmed(_Req(_event()))
    key = f"{narrative.collections.REWARD_EVENTS}/{REQUEST_ID}:settled"
    assert narrative.db.docs[key]["tx_hash"] == "TXHASH1"
    assert narrative.db.docs[key]["source"] == "narrative"


# ---------------------------------------------------------------------------
# The event is a pointer, not truth
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_the_event_cannot_inflate_the_amount(narrative):
    """A forged or stale event claiming a bigger payout must not be believed."""
    _seed_payout(narrative, amount=50.0)
    await narrative.routes.handle_narrative_payout_confirmed(
        _Req(_event(amount=999999.0, token="XRP"))
    )
    projection = narrative.service.get_rewards(KID)
    assert projection["currencies"]["ETASK"]["settled"] == 50.0
    assert "XRP" not in projection["currencies"]


@pytest.mark.asyncio
async def test_an_unconfirmed_payout_is_not_credited(narrative):
    _seed_payout(narrative, status="pending")
    result = await narrative.routes.handle_narrative_payout_confirmed(
        _Req(_event())
    )
    assert result["status"] == "ignored"
    assert narrative.service.get_rewards(KID)["token_score"] == 0.0


@pytest.mark.asyncio
async def test_a_failed_payout_is_not_credited(narrative):
    _seed_payout(narrative, status="failed")
    await narrative.routes.handle_narrative_payout_confirmed(_Req(_event()))
    assert narrative.service.get_rewards(KID)["token_score"] == 0.0


# ---------------------------------------------------------------------------
# Delivery semantics
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_a_redelivered_event_does_not_credit_twice(narrative):
    _seed_payout(narrative)
    first = await narrative.routes.handle_narrative_payout_confirmed(_Req(_event()))
    second = await narrative.routes.handle_narrative_payout_confirmed(_Req(_event()))
    assert first["credited"] == {KID: "created"}
    assert second["credited"] == {KID: "duplicate"}
    assert narrative.service.get_rewards(KID)["currencies"]["ETASK"]["settled"] == 250.0


@pytest.mark.asyncio
async def test_a_missing_payout_record_nacks_for_retry(narrative):
    """The record may not be committed yet when the event arrives."""
    with pytest.raises(HTTPException) as exc:
        await narrative.routes.handle_narrative_payout_confirmed(_Req(_event()))
    assert exc.value.status_code == 503


@pytest.mark.asyncio
async def test_a_malformed_message_is_acked_not_retried(narrative):
    """A poison message must not block the subscription forever."""
    result = await narrative.routes.handle_narrative_payout_confirmed(
        _Req(raw={"message": {"data": "!!!not-base64-json!!!"}})
    )
    assert result["status"] == "ignored"


@pytest.mark.asyncio
async def test_an_empty_envelope_is_ignored(narrative):
    result = await narrative.routes.handle_narrative_payout_confirmed(_Req(raw={}))
    assert result["status"] == "ignored"


@pytest.mark.asyncio
async def test_an_event_without_a_request_id_is_ignored(narrative):
    result = await narrative.routes.handle_narrative_payout_confirmed(
        _Req(_event(request_id=None))
    )
    assert result["status"] == "ignored"


@pytest.mark.asyncio
async def test_the_subscriber_requires_the_internal_token(narrative):
    from src.config.internal_auth import verify_internal_caller

    with pytest.raises(HTTPException) as exc:
        verify_internal_caller(_Req(_event(), headers={}))
    assert exc.value.status_code == 403
