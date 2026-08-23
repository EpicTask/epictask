"""
Coverage for the role custom-claim path.

The point of the claim is that authorizing a request costs nothing beyond the
signature check the backend already does. These tests pin the two halves of
that: the claim actually gets written, and a caller who already carries it
never touches Firestore.
"""

import pytest

from src.config import role_claims
from src.tests.users.fake_firestore import FakeAuth


@pytest.fixture
def fake_auth(monkeypatch):
    auth = FakeAuth()
    monkeypatch.setattr(role_claims, "auth", auth)
    role_claims.reset_cache()
    yield auth
    role_claims.reset_cache()


def _make_user(fake_auth, claims=None):
    user = fake_auth.create_user(email="kid@example.com", display_name="Kid")
    user.custom_claims = claims
    return user


# ---------------------------------------------------------------------------
# set_role_claim - the account-creation path
# ---------------------------------------------------------------------------

def test_set_role_claim_writes_the_role(fake_auth):
    user = _make_user(fake_auth)

    role_claims.set_role_claim(user.uid, "child")

    assert fake_auth.users[user.uid].custom_claims == {"role": "child"}


def test_set_role_claim_never_raises(fake_auth):
    # A claim failure must not take down account creation with it.
    role_claims.set_role_claim("no_such_uid", "child")


@pytest.mark.parametrize("uid,role", [("", "child"), ("uid_1", ""), ("uid_1", None)])
def test_set_role_claim_ignores_empty_input(fake_auth, uid, role):
    _make_user(fake_auth)

    role_claims.set_role_claim(uid, role)

    assert fake_auth.users["uid_1"].custom_claims is None


# ---------------------------------------------------------------------------
# sync_role_claim - the request-path repair
# ---------------------------------------------------------------------------

def test_sync_backfills_a_missing_claim(fake_auth):
    user = _make_user(fake_auth)

    role_claims.sync_role_claim(user.uid, "parent")

    assert fake_auth.users[user.uid].custom_claims == {"role": "parent"}


def test_sync_preserves_other_claims(fake_auth):
    user = _make_user(fake_auth, claims={"beta_tester": True})

    role_claims.sync_role_claim(user.uid, "parent")

    assert fake_auth.users[user.uid].custom_claims == {
        "beta_tester": True,
        "role": "parent",
    }


def test_sync_does_not_rewrite_within_the_ttl(fake_auth, monkeypatch):
    """
    The claim only reaches the client on its next token, so the same user keeps
    arriving without it for up to an hour. That window must not turn into one
    Identity Toolkit write per request.
    """
    user = _make_user(fake_auth)
    calls = []
    original = fake_auth.set_custom_user_claims
    monkeypatch.setattr(
        fake_auth,
        "set_custom_user_claims",
        lambda uid, claims: (calls.append(uid), original(uid, claims))[1],
    )

    for _ in range(5):
        role_claims.sync_role_claim(user.uid, "parent")

    assert calls == [user.uid]


def test_sync_writes_again_once_the_role_changes(fake_auth):
    user = _make_user(fake_auth)

    role_claims.sync_role_claim(user.uid, "child")
    role_claims.sync_role_claim(user.uid, "parent")

    assert fake_auth.users[user.uid].custom_claims == {"role": "parent"}


def test_sync_skips_when_the_claim_is_already_correct(fake_auth):
    user = _make_user(fake_auth, claims={"role": "parent"})
    role_claims.reset_cache()

    role_claims.sync_role_claim(user.uid, "parent")

    assert fake_auth.users[user.uid].custom_claims == {"role": "parent"}


def test_sync_tolerates_a_missing_auth_user(fake_auth):
    # Firestore profile with no Auth user behind it - must not raise.
    role_claims.sync_role_claim("ghost_uid", "parent")


@pytest.mark.parametrize("uid,role", [("", "parent"), ("uid_1", None)])
def test_sync_ignores_empty_input(fake_auth, uid, role):
    _make_user(fake_auth)

    role_claims.sync_role_claim(uid, role)

    assert fake_auth.users["uid_1"].custom_claims is None


# ---------------------------------------------------------------------------
# _get_caller_role - the payoff
# ---------------------------------------------------------------------------

def test_caller_role_from_token_skips_firestore(monkeypatch):
    from src.routes.tasks import task_routes

    def explode(uid):  # pragma: no cover - must never run
        raise AssertionError("Firestore was read despite a role claim")

    monkeypatch.setattr(task_routes.user_db, "get_user_profile", explode)

    assert task_routes._get_caller_role({"uid": "u1", "role": "parent"}) == "parent"


def test_caller_role_falls_back_and_repairs(fake_auth, monkeypatch):
    from src.routes.tasks import task_routes

    user = _make_user(fake_auth)
    monkeypatch.setattr(
        task_routes.user_db,
        "get_user_profile",
        lambda uid: {"uid": uid, "role": "parent"},
    )

    assert task_routes._get_caller_role({"uid": user.uid}) == "parent"
    # Repaired on the way through, so the next token carries it.
    assert fake_auth.users[user.uid].custom_claims == {"role": "parent"}


def test_caller_role_defaults_to_kid_without_a_profile(monkeypatch):
    from src.routes.tasks import task_routes

    monkeypatch.setattr(task_routes.user_db, "get_user_profile", lambda uid: None)

    assert task_routes._get_caller_role({"uid": "u1"}) == "kid"
