"""A minimal in-memory stand-in for the Firestore Admin client.

Enough of the surface to exercise user_db end to end — documents,
subcollections, batches, transactions and the handful of query filters the
user flows use — without credentials or a network round trip.
"""

import copy
from typing import Any, Dict, List, Optional


class _Sentinel:
    def __init__(self, name: str):
        self.name = name

    def __repr__(self):  # pragma: no cover - debugging aid
        return f"<{self.name}>"

    # Writes are deep-copied on the way in; a sentinel has to stay identical to
    # itself through that or `value is DELETE_FIELD` silently stops matching.
    def __deepcopy__(self, memo):
        return self

    def __copy__(self):
        return self


DELETE_FIELD = _Sentinel("DELETE_FIELD")


class ArrayUnion:
    def __init__(self, values):
        self.values = list(values)


class FieldFilter:
    def __init__(self, field, op, value):
        self.field = field
        self.op = op
        self.value = value

    def matches(self, data: dict) -> bool:
        actual = data.get(self.field)
        if self.op == "==":
            return actual == self.value
        if self.op == "in":
            return actual in self.value
        raise NotImplementedError(f"filter op {self.op}")


def _apply(target: Dict[str, Any], updates: Dict[str, Any]) -> None:
    for key, value in updates.items():
        if value is DELETE_FIELD:
            target.pop(key, None)
        elif isinstance(value, ArrayUnion):
            existing = list(target.get(key) or [])
            for item in value.values:
                if item not in existing:
                    existing.append(item)
            target[key] = existing
        else:
            target[key] = value


class FakeSnapshot:
    def __init__(self, doc_id: str, data: Optional[dict], reference: "FakeDocument"):
        self.id = doc_id
        self._data = data
        self.reference = reference

    @property
    def exists(self) -> bool:
        return self._data is not None

    def to_dict(self) -> Optional[dict]:
        return copy.deepcopy(self._data) if self._data is not None else None


class FakeDocument:
    def __init__(self, store: "FakeFirestore", path: str):
        self._store = store
        self.path = path
        self.id = path.split("/")[-1]

    def collection(self, name: str) -> "FakeCollection":
        return FakeCollection(self._store, f"{self.path}/{name}")

    def get(self, transaction=None) -> FakeSnapshot:
        return FakeSnapshot(self.id, self._store.docs.get(self.path), self)

    def set(self, data: dict, merge: bool = False) -> None:
        if merge and self.path in self._store.docs:
            _apply(self._store.docs[self.path], copy.deepcopy(data))
        else:
            merged: Dict[str, Any] = {}
            _apply(merged, copy.deepcopy(data))
            self._store.docs[self.path] = merged

    def update(self, data: dict) -> None:
        if self.path not in self._store.docs:
            raise KeyError(f"No document to update at {self.path}")
        _apply(self._store.docs[self.path], copy.deepcopy(data))

    def delete(self) -> None:
        self._store.docs.pop(self.path, None)


class FakeQuery:
    def __init__(self, store: "FakeFirestore", prefix: str, filters: List[FieldFilter]):
        self._store = store
        self._prefix = prefix
        self._filters = filters

    def where(self, filter=None, **_) -> "FakeQuery":
        return FakeQuery(self._store, self._prefix, self._filters + [filter])

    def stream(self):
        for path, data in list(self._store.docs.items()):
            if not path.startswith(self._prefix + "/"):
                continue
            # Direct children only — no cross-subcollection leakage.
            if "/" in path[len(self._prefix) + 1:]:
                continue
            if all(f.matches(data) for f in self._filters):
                yield FakeSnapshot(
                    path.split("/")[-1], data, FakeDocument(self._store, path)
                )


class FakeCollection(FakeQuery):
    def __init__(self, store: "FakeFirestore", path: str):
        super().__init__(store, path, [])
        self.path = path

    def document(self, doc_id: str) -> FakeDocument:
        return FakeDocument(self._store, f"{self.path}/{doc_id}")


class FakeBatch:
    def __init__(self, store: "FakeFirestore"):
        self._ops = []

    def set(self, ref: FakeDocument, data: dict, merge: bool = False):
        self._ops.append(("set", ref, data, merge))

    def update(self, ref: FakeDocument, data: dict):
        self._ops.append(("update", ref, data, None))

    def commit(self):
        for kind, ref, data, merge in self._ops:
            if kind == "set":
                ref.set(data, merge=merge)
            else:
                ref.update(data)
        self._ops = []


class FakeTransaction:
    """Reads pass straight through; writes apply on commit, as in Firestore."""

    def __init__(self, store: "FakeFirestore"):
        self._store = store
        self._ops = []

    def update(self, ref: FakeDocument, data: dict):
        self._ops.append((ref, data))

    def _commit(self):
        for ref, data in self._ops:
            ref.update(data)
        self._ops = []


class FakeFirestore:
    def __init__(self):
        self.docs: Dict[str, Dict[str, Any]] = {}

    def collection(self, name: str) -> FakeCollection:
        return FakeCollection(self, name)

    def batch(self) -> FakeBatch:
        return FakeBatch(self)

    def transaction(self) -> FakeTransaction:
        return FakeTransaction(self)


class FakeFirestoreModule:
    """Stands in for `firebase_admin.firestore` inside user_db."""

    ArrayUnion = ArrayUnion
    DELETE_FIELD = DELETE_FIELD

    @staticmethod
    def transactional(fn):
        def wrapper(transaction, *args, **kwargs):
            result = fn(transaction, *args, **kwargs)
            transaction._commit()
            return result

        return wrapper


class FakeAuthUser:
    def __init__(self, uid: str, email: Optional[str], display_name: Optional[str]):
        self.uid = uid
        self.email = email
        self.display_name = display_name
        self.custom_claims: Optional[Dict] = None


class EmailAlreadyExistsError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class FakeAuth:
    """Stands in for `firebase_admin.auth`."""

    def __init__(self):
        self.users: Dict[str, FakeAuthUser] = {}
        self._n = 0
        self.fail_next_create = False

    def create_user(self, email=None, password=None, display_name=None):
        if self.fail_next_create:
            self.fail_next_create = False
            raise RuntimeError("simulated Auth failure")
        if email and any(u.email == email for u in self.users.values()):
            raise EmailAlreadyExistsError(email)
        self._n += 1
        uid = f"uid_{self._n}"
        self.users[uid] = FakeAuthUser(uid, email, display_name)
        return self.users[uid]

    def delete_user(self, uid):
        self.users.pop(uid, None)

    def update_user(self, uid, **kwargs):
        return self.users.get(uid)

    # -- custom claims ----------------------------------------------------
    UserNotFoundError = UserNotFoundError

    def get_user(self, uid):
        user = self.users.get(uid)
        if user is None:
            raise UserNotFoundError(uid)
        return user

    def set_custom_user_claims(self, uid, claims):
        user = self.users.get(uid)
        if user is None:
            raise UserNotFoundError(uid)
        user.custom_claims = dict(claims) if claims else None
