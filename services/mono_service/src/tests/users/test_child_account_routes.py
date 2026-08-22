"""Authorization behaviour of the child-account endpoints.

The storage tests cover what these flows do; these cover who is allowed to do
them. /verify-pin in particular used to be unauthenticated, so anyone holding a
child uid could grind a 4-digit PIN.
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

    import src.routes.users.user_routes as user_routes

    fake_db = MagicMock()
    monkeypatch.setattr(user_routes, "user_db", fake_db)
    return user_routes, fake_db


PARENT = {"uid": "parent_1"}
PARENT_PROFILE = {"uid": "parent_1", "role": "parent", "display_name": "Sam"}
OTHER_PARENT_PROFILE = {"uid": "parent_2", "role": "parent", "display_name": "Alex"}
MANAGED_CHILD = {
    "uid": "child_1",
    "role": "child",
    "parent_id": "parent_1",
    "display_name": "Ada",
    "device_sharing_enabled": True,
}
TEEN = {
    "uid": "teen_1",
    "role": "child",
    "parent_id": "parent_1",
    "display_name": "Jo",
    "device_sharing_enabled": False,
}


def _profiles(mapping):
    return lambda uid: mapping.get(uid)


# ---------------------------------------------------------------------------
# /verify-pin
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_parent_can_verify_their_own_childs_pin(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles(
        {"parent_1": PARENT_PROFILE, "child_1": MANAGED_CHILD}
    )
    db.verify_child_pin.return_value = {"success": True, "child": {"uid": "child_1"}}

    request = user_routes.VerifyPinRequest(child_id="child_1", pin="2468")
    result = await user_routes.verify_pin(request, current_user=PARENT)

    assert result["success"] is True
    db.verify_child_pin.assert_called_once_with("child_1", "2468")


@pytest.mark.asyncio
async def test_a_stranger_cannot_verify_someone_elses_childs_pin(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles(
        {"parent_2": OTHER_PARENT_PROFILE, "child_1": MANAGED_CHILD}
    )

    request = user_routes.VerifyPinRequest(child_id="child_1", pin="2468")
    with pytest.raises(HTTPException) as exc:
        await user_routes.verify_pin(request, current_user={"uid": "parent_2"})

    assert exc.value.status_code == 403
    db.verify_child_pin.assert_not_called()


@pytest.mark.asyncio
async def test_parent_cannot_pin_into_a_teens_account(routes):
    """UC8 — a teen has their own credentials; switching in is impersonation."""
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles(
        {"parent_1": PARENT_PROFILE, "teen_1": TEEN}
    )

    request = user_routes.VerifyPinRequest(child_id="teen_1", pin="2468")
    with pytest.raises(HTTPException) as exc:
        await user_routes.verify_pin(request, current_user=PARENT)

    assert exc.value.status_code == 403
    assert "their own account" in exc.value.detail
    db.verify_child_pin.assert_not_called()


@pytest.mark.asyncio
async def test_a_teen_can_verify_their_own_pin(routes):
    """Needed by the self-service Change PIN screen."""
    user_routes, db = routes
    db.verify_child_pin.return_value = {"success": True, "child": {"uid": "teen_1"}}

    request = user_routes.VerifyPinRequest(child_id="teen_1", pin="9753")
    result = await user_routes.verify_pin(request, current_user={"uid": "teen_1"})

    assert result["success"] is True
    # Self-verification short-circuits the parent lookup entirely.
    db.get_user_profile.assert_not_called()


@pytest.mark.asyncio
async def test_wrong_pin_reports_remaining_tries(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles(
        {"parent_1": PARENT_PROFILE, "child_1": MANAGED_CHILD}
    )
    db.verify_child_pin.return_value = {
        "success": False,
        "message": "Invalid PIN",
        "attempts_remaining": 3,
    }

    request = user_routes.VerifyPinRequest(child_id="child_1", pin="0000")
    with pytest.raises(HTTPException) as exc:
        await user_routes.verify_pin(request, current_user=PARENT)

    assert exc.value.status_code == 400
    assert "3 tries left" in exc.value.detail


@pytest.mark.asyncio
async def test_lockout_returns_429_with_retry_after(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles(
        {"parent_1": PARENT_PROFILE, "child_1": MANAGED_CHILD}
    )
    db.verify_child_pin.return_value = {
        "success": False,
        "locked": True,
        "retry_after_seconds": 900,
        "message": "locked",
    }

    request = user_routes.VerifyPinRequest(child_id="child_1", pin="0000")
    with pytest.raises(HTTPException) as exc:
        await user_routes.verify_pin(request, current_user=PARENT)

    assert exc.value.status_code == 429
    assert exc.value.headers["Retry-After"] == "900"
    assert "15 minutes" in exc.value.detail


# ---------------------------------------------------------------------------
# /child-pin
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_parent_can_reset_their_own_childs_pin(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles(
        {"parent_1": PARENT_PROFILE, "child_1": MANAGED_CHILD}
    )

    request = user_routes.ChildPinUpdate(child_id="child_1", pin="1357")
    result = await user_routes.set_child_pin(request, current_user=PARENT)

    assert result["success"] is True
    db.set_child_pin.assert_called_once_with("child_1", "1357")


@pytest.mark.asyncio
async def test_a_stranger_cannot_reset_a_childs_pin(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles(
        {"parent_2": OTHER_PARENT_PROFILE, "child_1": MANAGED_CHILD}
    )

    request = user_routes.ChildPinUpdate(child_id="child_1", pin="1357")
    with pytest.raises(HTTPException) as exc:
        await user_routes.set_child_pin(request, current_user={"uid": "parent_2"})

    assert exc.value.status_code == 403
    db.set_child_pin.assert_not_called()


# ---------------------------------------------------------------------------
# Managed children and invites are parent-only
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_a_child_cannot_create_a_managed_child(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles({"child_1": MANAGED_CHILD})

    request = user_routes.ManagedChildCreate(
        display_name="Sibling", age=7, grade_level="2", pin="1122"
    )
    with pytest.raises(HTTPException) as exc:
        await user_routes.create_managed_child(request, current_user={"uid": "child_1"})

    assert exc.value.status_code == 403
    db.create_managed_child.assert_not_called()


@pytest.mark.asyncio
async def test_a_child_cannot_issue_an_invite(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles({"child_1": MANAGED_CHILD})

    request = user_routes.ChildInviteCreate(
        display_name="Friend", age=15, grade_level="10", child_email="f@x.com"
    )
    with pytest.raises(HTTPException) as exc:
        await user_routes.create_child_invite(request, current_user={"uid": "child_1"})

    assert exc.value.status_code == 403
    db.create_child_invite.assert_not_called()


@pytest.mark.asyncio
async def test_invite_carries_the_parents_display_name(routes):
    """The teen's join screen greets them with who invited them."""
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles({"parent_1": PARENT_PROFILE})
    db.create_child_invite.return_value = {"success": True, "invite_code": "K7M2QP"}

    request = user_routes.ChildInviteCreate(
        display_name="Jo", age=15, grade_level="10", child_email="jo@x.com"
    )
    await user_routes.create_child_invite(request, current_user=PARENT)

    args = db.create_child_invite.call_args[0]
    assert args[0] == "parent_1"
    assert args[1] == "Sam"


@pytest.mark.asyncio
async def test_age_band_errors_surface_as_400_not_500(routes):
    user_routes, db = routes
    db.get_user_profile.side_effect = _profiles({"parent_1": PARENT_PROFILE})
    db.create_managed_child.side_effect = ValueError("needs their own account")

    request = user_routes.ManagedChildCreate(
        display_name="Ada", age=12, grade_level="7", pin="1122"
    )
    with pytest.raises(HTTPException) as exc:
        await user_routes.create_managed_child(request, current_user=PARENT)

    assert exc.value.status_code == 400
    assert "own account" in exc.value.detail


@pytest.mark.asyncio
async def test_invite_preview_404s_for_an_unknown_code(routes):
    user_routes, db = routes
    db.get_child_invite.return_value = {"success": False, "message": "no such code"}

    with pytest.raises(HTTPException) as exc:
        await user_routes.preview_child_invite("ZZZZZZ")

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_redeem_surfaces_a_mismatched_email_as_400(routes):
    user_routes, db = routes
    db.redeem_child_invite.side_effect = ValueError("That email doesn't match")

    request = user_routes.ChildInviteRedeem(
        email="wrong@x.com", password="hunter2hunter2", pin="1234"
    )
    with pytest.raises(HTTPException) as exc:
        await user_routes.redeem_child_invite("K7M2QP", request)

    assert exc.value.status_code == 400
    assert "doesn't match" in exc.value.detail


@pytest.mark.asyncio
async def test_age_policy_endpoint_matches_the_policy_module(routes):
    user_routes, _ = routes
    from src.config import age_policy

    result = await user_routes.get_age_policy()
    assert result["teen_min_age"] == age_policy.TEEN_MIN_AGE
    assert result["min_child_age"] == age_policy.MIN_CHILD_AGE
    assert result["max_child_age"] == age_policy.MAX_CHILD_AGE
