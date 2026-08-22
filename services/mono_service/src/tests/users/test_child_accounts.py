"""End-to-end coverage of the two child signup paths and the PIN gate.

Walks the ten use cases the parent/child flows have to satisfy against an
in-memory Firestore, so a regression in the age policy, the invite lifecycle or
the PIN lockout fails here rather than in the app.
"""

import datetime
import sys
import types

import pytest

from src.tests.users.fake_firestore import (
    EmailAlreadyExistsError,
    FakeAuth,
    FakeFirestore,
    FakeFirestoreModule,
    FieldFilter,
)


@pytest.fixture
def db_and_auth(monkeypatch):
    """Import user_db with Firestore/Auth swapped for in-memory fakes."""
    # firebase_config initialises a real client at import time; stub it first.
    fake_db = FakeFirestore()
    stub_config = types.ModuleType("src.config.firebase_config")
    stub_config.db = fake_db
    sys.modules["src.config.firebase_config"] = stub_config

    import src.storage.user_db as user_db  # noqa: E402  (import after the stub)
    import importlib

    user_db = importlib.reload(user_db)

    fake_auth = FakeAuth()
    monkeypatch.setattr(user_db, "db", fake_db)
    monkeypatch.setattr(user_db, "auth", fake_auth)
    monkeypatch.setattr(user_db, "firestore", FakeFirestoreModule)
    monkeypatch.setattr(user_db, "FieldFilter", FieldFilter)

    # A signed-up parent.
    fake_db.docs["users/parent_1"] = {
        "uid": "parent_1",
        "role": "parent",
        "display_name": "Sam Rivera",
        "email": "sam@example.com",
        "children": [],
    }

    return user_db, fake_db, fake_auth


def _security(fake_db, uid):
    return fake_db.docs.get(f"users/{uid}/private/security")


# ---------------------------------------------------------------------------
# UC2 — parent adds an under-13 child
# ---------------------------------------------------------------------------

def test_managed_child_is_created_and_linked(db_and_auth):
    user_db, fake_db, fake_auth = db_and_auth

    result = user_db.create_managed_child(
        "parent_1",
        {
            "display_name": "Ada Rivera",
            "age": 8,
            "grade_level": "3",
            "pin": "2468",
            "avatar_key": "avatar2",
            "parental_consent_at": "2026-08-22T10:00:00+00:00",
        },
    )

    assert result["success"] is True
    child_uid = result["child"]["uid"]
    profile = fake_db.docs[f"users/{child_uid}"]

    assert profile["role"] == "child"
    assert profile["account_type"] == "managed"
    assert profile["parent_id"] == "parent_1"
    assert profile["device_sharing_enabled"] is True
    assert profile["parental_consent_at"] == "2026-08-22T10:00:00+00:00"
    assert profile["avatar_key"] == "avatar2"

    # Linked both ways, and the child can never sign in on their own.
    assert child_uid in fake_db.docs["users/parent_1"]["children"]
    assert fake_auth.users[child_uid].email is None

    # The PIN hash never touches the profile document.
    assert "pin_hash" not in profile
    assert "pin_hash" not in result["child"]
    stored = _security(fake_db, child_uid)
    assert stored["pin_hash"].startswith("$2")
    assert stored["pin_hash"] != "2468"


def test_managed_child_rejects_teen_age(db_and_auth):
    user_db, _, _ = db_and_auth
    with pytest.raises(ValueError, match="own account"):
        user_db.create_managed_child(
            "parent_1",
            {"display_name": "Teen", "age": 15, "grade_level": "10", "pin": "1111"},
        )


def test_failed_managed_child_creation_leaves_no_orphan_auth_user(db_and_auth):
    user_db, fake_db, fake_auth = db_and_auth
    fake_auth.fail_next_create = True

    with pytest.raises(RuntimeError):
        user_db.create_managed_child(
            "parent_1",
            {"display_name": "Ada", "age": 8, "grade_level": "3", "pin": "2468"},
        )

    assert fake_auth.users == {}
    assert fake_db.docs["users/parent_1"]["children"] == []


# ---------------------------------------------------------------------------
# UC3 / UC4 — PIN gate, lockout, reset
# ---------------------------------------------------------------------------

def _make_child(user_db, pin="2468", age=8):
    result = user_db.create_managed_child(
        "parent_1",
        {"display_name": "Ada Rivera", "age": age, "grade_level": "3", "pin": pin},
    )
    return result["child"]["uid"]


def test_correct_pin_returns_display_safe_child_only(db_and_auth):
    user_db, _, _ = db_and_auth
    uid = _make_child(user_db)

    result = user_db.verify_child_pin(uid, "2468")

    assert result["success"] is True
    assert result["child"]["display_name"] == "Ada Rivera"
    assert result["child"]["age"] == 8
    # No hash, no lockout state, no arbitrary profile fields.
    assert "pin_hash" not in result["child"]
    assert set(result["child"]) == {
        "uid", "display_name", "age", "grade_level", "photo_url",
        "avatar_key", "parent_id", "account_type", "device_sharing_enabled",
    }


def test_wrong_pin_counts_down_then_locks(db_and_auth):
    user_db, fake_db, _ = db_and_auth
    uid = _make_child(user_db)

    for attempt in range(1, user_db.PIN_MAX_ATTEMPTS):
        res = user_db.verify_child_pin(uid, "0000")
        assert res["success"] is False
        assert res.get("locked") is not True
        assert res["attempts_remaining"] == user_db.PIN_MAX_ATTEMPTS - attempt

    locked = user_db.verify_child_pin(uid, "0000")
    assert locked["locked"] is True
    assert locked["retry_after_seconds"] > 0

    # Locked out even with the right PIN.
    assert user_db.verify_child_pin(uid, "2468")["locked"] is True

    # The counter is in Firestore, not in process memory, so it survives a
    # restart — the old in-memory dict could be cleared by redeploying.
    assert _security(fake_db, uid)["locked_until"] is not None


def test_successful_pin_resets_the_counter(db_and_auth):
    user_db, fake_db, _ = db_and_auth
    uid = _make_child(user_db)

    user_db.verify_child_pin(uid, "0000")
    user_db.verify_child_pin(uid, "0000")
    assert _security(fake_db, uid)["failed_attempts"] == 2

    assert user_db.verify_child_pin(uid, "2468")["success"] is True
    assert _security(fake_db, uid)["failed_attempts"] == 0


def test_parent_reset_clears_lockout(db_and_auth):
    user_db, _, _ = db_and_auth
    uid = _make_child(user_db)

    for _ in range(user_db.PIN_MAX_ATTEMPTS):
        user_db.verify_child_pin(uid, "0000")
    assert user_db.verify_child_pin(uid, "2468")["locked"] is True

    user_db.set_child_pin(uid, "1357")

    assert user_db.verify_child_pin(uid, "1357")["success"] is True
    assert user_db.verify_child_pin(uid, "2468")["success"] is False


def test_unknown_child_is_indistinguishable_from_a_wrong_pin(db_and_auth):
    user_db, _, _ = db_and_auth
    res = user_db.verify_child_pin("does_not_exist", "1234")
    assert res["success"] is False
    assert res["message"] == "Invalid PIN"


def test_legacy_plaintext_pin_is_accepted_once_then_migrated(db_and_auth):
    """Teens created by the old signup path had their PIN stored unhashed."""
    user_db, fake_db, _ = db_and_auth
    fake_db.docs["users/legacy_kid"] = {
        "uid": "legacy_kid",
        "role": "child",
        "display_name": "Legacy Kid",
        "age": 10,
        "parent_id": "parent_1",
        "device_sharing_enabled": True,
        "pin_hash": "4321",  # plaintext, as written by the old client
    }

    assert user_db.verify_child_pin("legacy_kid", "4321")["success"] is True

    # Migrated into the private doc as a hash, and scrubbed from the profile.
    assert "pin_hash" not in fake_db.docs["users/legacy_kid"]
    assert _security(fake_db, "legacy_kid")["pin_hash"].startswith("$2")
    assert user_db.verify_child_pin("legacy_kid", "4321")["success"] is True
    assert user_db.verify_child_pin("legacy_kid", "0000")["success"] is False


# ---------------------------------------------------------------------------
# UC5 — teen invite lifecycle
# ---------------------------------------------------------------------------

def _make_invite(user_db, email="jo@example.com", age=15):
    return user_db.create_child_invite(
        "parent_1",
        "Sam Rivera",
        {
            "display_name": "Jo Rivera",
            "age": age,
            "grade_level": "10",
            "child_email": email,
            "parental_consent_at": "2026-08-22T10:00:00+00:00",
        },
    )


def test_invite_is_issued_with_a_readable_code_and_masked_email(db_and_auth):
    user_db, _, _ = db_and_auth
    result = _make_invite(user_db)

    code = result["invite_code"]
    assert len(code) == user_db.INVITE_CODE_LENGTH
    # Ambiguous glyphs are excluded — these codes get read aloud.
    assert not set(code) & set("IO01")
    assert result["invite"]["child_email_masked"].endswith("@example.com")
    assert "jo@example.com" not in result["invite"]["child_email_masked"]
    assert result["invite"]["parent_name"] == "Sam Rivera"


def test_invite_rejects_under_13(db_and_auth):
    user_db, _, _ = db_and_auth
    with pytest.raises(ValueError, match="managed profile"):
        _make_invite(user_db, age=9)


def test_redeem_creates_a_linked_independent_account(db_and_auth):
    user_db, fake_db, fake_auth = db_and_auth
    code = _make_invite(user_db)["invite_code"]

    result = user_db.redeem_child_invite(
        code=code, email="JO@Example.com", password="hunter2hunter2", pin="9753",
        avatar_key="avatar3",
    )

    assert result["success"] is True
    uid = result["uid"]
    profile = fake_db.docs[f"users/{uid}"]

    # The family link comes from the invite, not from whoever is signed in.
    # This is the regression that used to invert parent and child.
    assert profile["parent_id"] == "parent_1"
    assert profile["role"] == "child"
    assert profile["account_type"] == "independent"
    assert uid in fake_db.docs["users/parent_1"]["children"]
    assert "parent_id" not in fake_db.docs["users/parent_1"]
    assert fake_db.docs["users/parent_1"]["children"] == [uid]
    assert fake_db.docs["users/parent_1"]["role"] == "parent"

    # Teens are not switchable from the parent's device — UC8.
    assert profile["device_sharing_enabled"] is False

    # Consent captured at invite time carries onto the profile.
    assert profile["parental_consent_at"] == "2026-08-22T10:00:00+00:00"

    # Real credentials, email normalised, PIN hashed out of band.
    assert fake_auth.users[uid].email == "jo@example.com"
    assert _security(fake_db, uid)["pin_hash"].startswith("$2")


def test_redeem_rejects_a_mismatched_email(db_and_auth):
    user_db, fake_db, fake_auth = db_and_auth
    code = _make_invite(user_db)["invite_code"]

    with pytest.raises(ValueError, match="doesn't match"):
        user_db.redeem_child_invite(
            code=code, email="someone.else@example.com",
            password="hunter2hunter2", pin="9753",
        )

    # No account made, and the code stays usable for the real teen.
    assert fake_auth.users == {}
    assert user_db.get_child_invite(code)["success"] is True


def test_redeem_is_single_use(db_and_auth):
    user_db, _, _ = db_and_auth
    code = _make_invite(user_db)["invite_code"]
    user_db.redeem_child_invite(
        code=code, email="jo@example.com", password="hunter2hunter2", pin="9753"
    )

    with pytest.raises(ValueError, match="already been used"):
        user_db.redeem_child_invite(
            code=code, email="jo@example.com", password="hunter2hunter2", pin="1122"
        )
    assert user_db.get_child_invite(code)["success"] is False


def test_expired_invite_is_refused(db_and_auth):
    user_db, fake_db, _ = db_and_auth
    code = _make_invite(user_db)["invite_code"]
    past = (
        datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    ).isoformat()
    fake_db.docs[f"{user_db.collections.CHILD_INVITES}/{code}"]["expires_at"] = past

    preview = user_db.get_child_invite(code)
    assert preview["success"] is False
    assert "expired" in preview["message"]

    with pytest.raises(ValueError, match="expired"):
        user_db.redeem_child_invite(
            code=code, email="jo@example.com", password="hunter2hunter2", pin="9753"
        )


def test_a_failed_redeem_releases_the_code_for_a_retry(db_and_auth):
    user_db, _, fake_auth = db_and_auth
    code = _make_invite(user_db)["invite_code"]
    fake_auth.fail_next_create = True

    with pytest.raises(RuntimeError):
        user_db.redeem_child_invite(
            code=code, email="jo@example.com", password="hunter2hunter2", pin="9753"
        )

    # Not left stuck in "claiming" — the teen can try again.
    assert user_db.get_child_invite(code)["success"] is True
    result = user_db.redeem_child_invite(
        code=code, email="jo@example.com", password="hunter2hunter2", pin="9753"
    )
    assert result["success"] is True


def test_existing_email_surfaces_as_a_conflict(db_and_auth):
    user_db, _, fake_auth = db_and_auth
    fake_auth.create_user(email="jo@example.com", password="x", display_name="Jo")
    code = _make_invite(user_db)["invite_code"]

    with pytest.raises(EmailAlreadyExistsError):
        user_db.redeem_child_invite(
            code=code, email="jo@example.com", password="hunter2hunter2", pin="9753"
        )
    assert user_db.get_child_invite(code)["success"] is True


def test_reissuing_supersedes_the_previous_code_for_that_child(db_and_auth):
    user_db, _, _ = db_and_auth
    first = _make_invite(user_db)["invite_code"]
    second = _make_invite(user_db)["invite_code"]

    assert first != second
    assert user_db.get_child_invite(first)["success"] is False
    assert user_db.get_child_invite(second)["success"] is True

    codes = [i["code"] for i in user_db.list_child_invites("parent_1")]
    assert codes == [second]


def test_parent_can_revoke_an_invite_but_only_their_own(db_and_auth):
    user_db, _, _ = db_and_auth
    code = _make_invite(user_db)["invite_code"]

    assert user_db.revoke_child_invite("some_other_parent", code) is False
    assert user_db.revoke_child_invite("parent_1", code) is True
    assert user_db.get_child_invite(code)["success"] is False
    # Revoking twice is a no-op rather than an error.
    assert user_db.revoke_child_invite("parent_1", code) is False


def test_unknown_code_is_reported_plainly(db_and_auth):
    user_db, _, _ = db_and_auth
    result = user_db.get_child_invite("ZZZZZZ")
    assert result["success"] is False
    assert "doesn't exist" in result["message"]


def test_codes_are_matched_case_insensitively(db_and_auth):
    user_db, _, _ = db_and_auth
    code = _make_invite(user_db)["invite_code"]
    assert user_db.get_child_invite(code.lower())["success"] is True
    result = user_db.redeem_child_invite(
        code=f"  {code.lower()}  ", email="jo@example.com",
        password="hunter2hunter2", pin="9753",
    )
    assert result["success"] is True
