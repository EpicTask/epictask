"""Authorization on the leaderboard endpoints.

These endpoints took an ID straight from the path and never compared it to the
caller, so any signed-in user could read any family's earnings or any child's
reward history by substituting a uid. The Firestore rules hardening did not
cover this — it is an HTTP route, not a rules path.
"""
import sys
import types
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from src.tests.users.fake_firestore import FakeFirestore


@pytest.fixture
def routes(monkeypatch):
    sys.modules.setdefault(
        "src.config.firebase_config",
        types.ModuleType("src.config.firebase_config"),
    ).db = FakeFirestore()

    import src.routes.tasks.task_routes as task_routes

    fake_user_db = MagicMock()
    fake_user_db.get_user_profile.side_effect = lambda uid: {
        "parent_1": {"uid": "parent_1", "role": "parent", "children": ["child_1"]},
        "parent_2": {"uid": "parent_2", "role": "parent", "children": ["child_9"]},
        "child_1": {"uid": "child_1", "role": "child", "parent_id": "parent_1"},
    }.get(uid)
    monkeypatch.setattr(task_routes, "user_db", fake_user_db)

    fake_service = MagicMock()

    async def _family(parent_id):
        return {"parent_id": parent_id}

    async def _kid(kid_id):
        return {"kid_id": kid_id}

    fake_service.get_family_leaderboard.side_effect = _family
    fake_service.get_kid_leaderboard_view.side_effect = _kid
    monkeypatch.setattr(task_routes, "leaderboard_service", fake_service)

    return task_routes, fake_service


PARENT = {"uid": "parent_1", "role": "parent"}
OTHER_PARENT = {"uid": "parent_2", "role": "parent"}
CHILD = {"uid": "child_1", "role": "child"}
ADMIN = {"uid": "admin_1", "role": "admin"}


# ---------------------------------------------------------------------------
# /leaderboard/family/{parent_id}
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_parent_can_read_their_own_family_leaderboard(routes):
    task_routes, _ = routes
    result = await task_routes.get_family_leaderboard("parent_1", current_user=PARENT)
    assert result == {"parent_id": "parent_1"}


@pytest.mark.asyncio
async def test_another_parent_cannot_read_someone_elses_family(routes):
    task_routes, service = routes
    with pytest.raises(HTTPException) as exc:
        await task_routes.get_family_leaderboard("parent_1", current_user=OTHER_PARENT)
    assert exc.value.status_code == 403
    service.get_family_leaderboard.assert_not_called()


@pytest.mark.asyncio
async def test_a_child_cannot_read_the_family_leaderboard(routes):
    task_routes, _ = routes
    with pytest.raises(HTTPException) as exc:
        await task_routes.get_family_leaderboard("parent_1", current_user=CHILD)
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_read_any_family(routes):
    task_routes, _ = routes
    result = await task_routes.get_family_leaderboard("parent_1", current_user=ADMIN)
    assert result == {"parent_id": "parent_1"}


# ---------------------------------------------------------------------------
# /leaderboard/kid/{kid_id}
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_child_can_read_their_own_rewards(routes):
    task_routes, _ = routes
    result = await task_routes.get_kid_leaderboard_view("child_1", current_user=CHILD)
    assert result == {"kid_id": "child_1"}


@pytest.mark.asyncio
async def test_parent_can_read_their_own_childs_rewards(routes):
    task_routes, _ = routes
    result = await task_routes.get_kid_leaderboard_view("child_1", current_user=PARENT)
    assert result == {"kid_id": "child_1"}


@pytest.mark.asyncio
async def test_unrelated_parent_cannot_read_another_familys_child(routes):
    task_routes, service = routes
    with pytest.raises(HTTPException) as exc:
        await task_routes.get_kid_leaderboard_view("child_1", current_user=OTHER_PARENT)
    assert exc.value.status_code == 403
    service.get_kid_leaderboard_view.assert_not_called()


@pytest.mark.asyncio
async def test_a_child_cannot_read_a_siblings_rewards(routes):
    task_routes, _ = routes
    with pytest.raises(HTTPException) as exc:
        await task_routes.get_kid_leaderboard_view("child_9", current_user=CHILD)
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_read_any_childs_rewards(routes):
    task_routes, _ = routes
    result = await task_routes.get_kid_leaderboard_view("child_1", current_user=ADMIN)
    assert result == {"kid_id": "child_1"}


# ---------------------------------------------------------------------------
# /{task_id}/reward and /{task_id}/verify
#
# Parent role alone was the only gate on these. /verify additionally initiates
# an XRPL payment against the *task owner's* wallet, so an unrelated parent
# could push signing requests at someone else's Xumm app.
# ---------------------------------------------------------------------------

@pytest.fixture
def task_routes_with_owner(monkeypatch):
    sys.modules.setdefault(
        "src.config.firebase_config",
        types.ModuleType("src.config.firebase_config"),
    ).db = FakeFirestore()

    import src.routes.tasks.task_routes as task_routes

    fake_user_db = MagicMock()
    fake_user_db.get_user_profile.side_effect = lambda uid: {
        "parent_1": {"uid": "parent_1", "role": "parent", "children": ["child_1"]},
        "parent_2": {"uid": "parent_2", "role": "parent", "children": []},
    }.get(uid)
    monkeypatch.setattr(task_routes, "user_db", fake_user_db)

    fake_task_service = MagicMock()

    async def _get_task(task_id):
        # Owned by parent_1.
        return {"task_id": task_id, "user_id": "parent_1"}

    async def _reward(request):
        return "rewarded"

    async def _verify(request, auth_token=""):
        return "verified"

    fake_task_service.get_task.side_effect = _get_task
    fake_task_service.reward_task.side_effect = _reward
    fake_task_service.verify_task.side_effect = _verify
    monkeypatch.setattr(task_routes, "task_service", fake_task_service)

    return task_routes, fake_task_service


class _Req:
    """Minimal stand-in for the raw Request verify_task reads a header from."""

    headers = {"Authorization": "Bearer t"}


@pytest.mark.asyncio
async def test_owner_can_reward_their_own_task(task_routes_with_owner):
    from src.domain.task_models import TaskRewarded

    task_routes, service = task_routes_with_owner
    request = TaskRewarded(task_id="task_1", user_id="parent_1")
    result = await task_routes.reward_task("task_1", request, current_user=PARENT)
    assert result == {"response": "rewarded"}
    service.reward_task.assert_called_once()


@pytest.mark.asyncio
async def test_another_parent_cannot_reward_someone_elses_task(task_routes_with_owner):
    from src.domain.task_models import TaskRewarded

    task_routes, service = task_routes_with_owner
    request = TaskRewarded(task_id="task_1", user_id="parent_2")
    with pytest.raises(HTTPException) as exc:
        await task_routes.reward_task("task_1", request, current_user=OTHER_PARENT)
    assert exc.value.status_code == 403
    service.reward_task.assert_not_called()


@pytest.mark.asyncio
async def test_reward_rejects_a_path_body_task_id_mismatch(task_routes_with_owner):
    from src.domain.task_models import TaskRewarded

    task_routes, service = task_routes_with_owner
    request = TaskRewarded(task_id="task_OTHER", user_id="parent_1")
    with pytest.raises(HTTPException) as exc:
        await task_routes.reward_task("task_1", request, current_user=PARENT)
    assert exc.value.status_code == 400
    service.reward_task.assert_not_called()


@pytest.mark.asyncio
async def test_another_parent_cannot_verify_someone_elses_task(task_routes_with_owner):
    """The payment is drawn against the owner's wallet, so this one matters."""
    from src.domain.task_models import TaskVerified

    task_routes, service = task_routes_with_owner
    request = TaskVerified(
        task_id="task_1", verified=True, verification_method="user", user_id="parent_2"
    )
    with pytest.raises(HTTPException) as exc:
        await task_routes.verify_task(
            "task_1", request, _Req(), current_user=OTHER_PARENT
        )
    assert exc.value.status_code == 403
    service.verify_task.assert_not_called()


@pytest.mark.asyncio
async def test_owner_can_verify_their_own_task(task_routes_with_owner):
    from src.domain.task_models import TaskVerified

    task_routes, service = task_routes_with_owner
    request = TaskVerified(
        task_id="task_1", verified=True, verification_method="user", user_id="parent_1"
    )
    result = await task_routes.verify_task(
        "task_1", request, _Req(), current_user=PARENT
    )
    assert result == {"response": "verified"}
    service.verify_task.assert_called_once()
