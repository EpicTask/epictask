"""
Coverage for the two auth dependencies.

`get_current_user` is the cheap path: a local signature check, no network.
`get_current_user_strict` additionally asks Firebase whether the session was
revoked or the account disabled, and is reserved for routes where honouring a
still-unexpired token for up to an hour would be wrong.
"""

import types

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from firebase_admin import auth as real_auth
from firebase_admin import exceptions as firebase_exceptions

from src.config import security


def _stub_auth(monkeypatch, raises=None):
    """Swap security.auth for a stub that records how it was called."""
    calls = []

    def verify_id_token(token, check_revoked=False):
        calls.append({"token": token, "check_revoked": check_revoked})
        if raises is not None:
            raise raises
        return {"uid": "u1", "role": "parent"}

    stub = types.SimpleNamespace(
        verify_id_token=verify_id_token,
        RevokedIdTokenError=real_auth.RevokedIdTokenError,
        UserDisabledError=real_auth.UserDisabledError,
        ExpiredIdTokenError=real_auth.ExpiredIdTokenError,
        InvalidIdTokenError=real_auth.InvalidIdTokenError,
        CertificateFetchError=real_auth.CertificateFetchError,
    )
    monkeypatch.setattr(security, "auth", stub)
    return calls


def _creds(token="tok"):
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


# ---------------------------------------------------------------------------
# the cheap path
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_current_user_does_not_check_revocation(monkeypatch):
    calls = _stub_auth(monkeypatch)

    result = await security.get_current_user(_creds())

    assert result["uid"] == "u1"
    assert calls == [{"token": "tok", "check_revoked": False}]


@pytest.mark.asyncio
async def test_get_current_user_requires_credentials(monkeypatch):
    _stub_auth(monkeypatch)

    with pytest.raises(HTTPException) as exc:
        await security.get_current_user(None)

    assert exc.value.status_code == 401


# ---------------------------------------------------------------------------
# the strict path
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_strict_checks_revocation(monkeypatch):
    calls = _stub_auth(monkeypatch)

    result = await security.get_current_user_strict(_creds())

    assert result["uid"] == "u1"
    assert calls == [{"token": "tok", "check_revoked": True}]


@pytest.mark.asyncio
async def test_strict_requires_credentials(monkeypatch):
    _stub_auth(monkeypatch)

    with pytest.raises(HTTPException) as exc:
        await security.get_current_user_strict(None)

    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_strict_rejects_a_revoked_session(monkeypatch):
    _stub_auth(monkeypatch, raises=real_auth.RevokedIdTokenError("revoked"))

    with pytest.raises(HTTPException) as exc:
        await security.get_current_user_strict(_creds())

    assert exc.value.status_code == 401
    assert "revoked" in exc.value.detail.lower()


@pytest.mark.asyncio
async def test_strict_rejects_a_disabled_account(monkeypatch):
    _stub_auth(monkeypatch, raises=real_auth.UserDisabledError("disabled"))

    with pytest.raises(HTTPException) as exc:
        await security.get_current_user_strict(_creds())

    assert exc.value.status_code == 401
    assert "disabled" in exc.value.detail.lower()


# ---------------------------------------------------------------------------
# shared error mapping
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
@pytest.mark.parametrize(
    "error,fragment",
    [
        (real_auth.ExpiredIdTokenError("expired", None), "expired"),
        (real_auth.InvalidIdTokenError("bad"), "invalid"),
        (RuntimeError("boom"), "authentication failed"),
    ],
)
async def test_errors_map_to_401(monkeypatch, error, fragment):
    _stub_auth(monkeypatch, raises=error)

    with pytest.raises(HTTPException) as exc:
        await security.get_current_user(_creds())

    assert exc.value.status_code == 401
    assert fragment in exc.value.detail.lower()
    assert exc.value.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.asyncio
async def test_revoked_is_not_swallowed_by_the_invalid_handler(monkeypatch):
    """RevokedIdTokenError subclasses InvalidIdTokenError - order matters."""
    assert issubclass(real_auth.RevokedIdTokenError, real_auth.InvalidIdTokenError)
    _stub_auth(monkeypatch, raises=real_auth.RevokedIdTokenError("revoked"))

    with pytest.raises(HTTPException) as exc:
        await security.get_current_user_strict(_creds())

    assert "revoked" in exc.value.detail.lower()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "error",
    [
        real_auth.CertificateFetchError("net", None),
        firebase_exceptions.UnavailableError("down", None),
        firebase_exceptions.DeadlineExceededError("slow", None),
    ],
)
async def test_transport_failures_are_503_not_401(monkeypatch, error):
    """
    A Google-side blip on the strict path must not read as "your credentials
    are bad" - that would bounce a signed-in parent to the login screen.
    """
    stub = _stub_auth(monkeypatch, raises=error)  # noqa: F841

    with pytest.raises(HTTPException) as exc:
        await security.get_current_user_strict(_creds())

    assert exc.value.status_code == 503
