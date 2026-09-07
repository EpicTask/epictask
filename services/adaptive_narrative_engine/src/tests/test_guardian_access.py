"""Parent-acting-for-child access on the narrative routes.

Children aged 5-12 are "managed": they hold a Firebase uid but no credentials,
so the device stays signed in as the parent while the app runs with the child
as the active context. Every narrative call therefore arrives with the parent's
token and the child's `user_id`.

The routes previously used `validate_user_ownership`, which required exact uid
equality, so `POST /progress/start` returned 403 for every managed child — the
whole 5-12 story flow. This loosens that check, so the boundary it draws needs
holding down precisely.
"""
import pytest
from fastapi import HTTPException

import src.services.firestore as firestore_module
from src.services.firestore import is_guardian_of, validate_user_access


PARENT = "parent_1"
CHILD = "child_1"
LEGACY_CHILD = "child_legacy"
STRANGER = "stranger_1"
OTHER_PARENT = "parent_2"

PROFILES = {
    PARENT: {"uid": PARENT, "role": "parent", "children": [CHILD]},
    CHILD: {"uid": CHILD, "role": "child", "parent_id": PARENT},
    # Predates the parent's `children` array — linked only from the child side.
    LEGACY_CHILD: {"uid": LEGACY_CHILD, "role": "child", "parent_id": PARENT},
    OTHER_PARENT: {"uid": OTHER_PARENT, "role": "parent", "children": ["child_9"]},
    STRANGER: {"uid": STRANGER, "role": "parent"},
}


class _Doc:
    def __init__(self, data):
        self._data = data

    @property
    def exists(self):
        return self._data is not None

    def to_dict(self):
        return self._data


class _DocRef:
    def __init__(self, uid):
        self._uid = uid

    def get(self):
        return _Doc(PROFILES.get(self._uid))


class _Collection:
    def document(self, uid):
        return _DocRef(uid)


class _DB:
    def collection(self, name):
        assert name == "users", name
        return _Collection()


@pytest.fixture(autouse=True)
def fake_db(monkeypatch):
    monkeypatch.setattr(firestore_module, "db", _DB())


# ---------------------------------------------------------------------------
# The flow this fixes
# ---------------------------------------------------------------------------

def test_a_parent_may_act_for_their_own_child():
    assert is_guardian_of(PARENT, CHILD) is True
    validate_user_access(PARENT, CHILD)


def test_a_parent_may_act_for_a_child_linked_only_by_parent_id():
    """Older child documents are missing from the parent's `children` array."""
    assert is_guardian_of(PARENT, LEGACY_CHILD) is True
    validate_user_access(PARENT, LEGACY_CHILD)


def test_a_user_may_still_act_for_themselves():
    """Teens 13-18 authenticate as themselves, so this is their whole path."""
    validate_user_access(CHILD, CHILD)
    validate_user_access(PARENT, PARENT)


def test_acting_for_yourself_needs_no_firestore_read(monkeypatch):
    """The self path must stay a fast path — no profile lookup."""
    def _explode(*a, **k):
        raise AssertionError("must not read Firestore for the self case")

    monkeypatch.setattr(firestore_module, "db", type("X", (), {"collection": _explode})())
    validate_user_access(CHILD, CHILD)


# ---------------------------------------------------------------------------
# The boundary it must not cross
# ---------------------------------------------------------------------------

def test_a_parent_cannot_act_for_another_familys_child():
    assert is_guardian_of(OTHER_PARENT, CHILD) is False
    with pytest.raises(HTTPException) as exc:
        validate_user_access(OTHER_PARENT, CHILD)
    assert exc.value.status_code == 403


def test_an_unrelated_user_cannot_act_for_a_child():
    with pytest.raises(HTTPException) as exc:
        validate_user_access(STRANGER, CHILD)
    assert exc.value.status_code == 403


def test_a_child_cannot_act_for_their_parent():
    """Guardianship is one-directional."""
    with pytest.raises(HTTPException) as exc:
        validate_user_access(CHILD, PARENT)
    assert exc.value.status_code == 403


def test_a_child_cannot_act_for_a_sibling():
    PROFILES[PARENT]["children"].append("child_sib")
    PROFILES["child_sib"] = {"uid": "child_sib", "role": "child", "parent_id": PARENT}
    try:
        with pytest.raises(HTTPException) as exc:
            validate_user_access(CHILD, "child_sib")
        assert exc.value.status_code == 403
    finally:
        PROFILES[PARENT]["children"].remove("child_sib")
        PROFILES.pop("child_sib")


def test_an_unknown_uid_is_denied():
    with pytest.raises(HTTPException):
        validate_user_access(PARENT, "nobody")


@pytest.mark.parametrize("caller,target", [("", CHILD), (PARENT, ""), (None, None)])
def test_missing_identifiers_are_denied(caller, target):
    assert is_guardian_of(caller, target) is False


def test_the_link_is_never_taken_from_the_request():
    """A caller claiming a child in their own payload proves nothing — the
    check reads the stored profile, so a profile with no children denies."""
    assert is_guardian_of(STRANGER, CHILD) is False


def test_a_firestore_failure_denies_rather_than_allows():
    def _boom(*a, **k):
        raise RuntimeError("firestore down")

    firestore_module.db = type("X", (), {"collection": _boom})()
    assert is_guardian_of(PARENT, CHILD) is False
