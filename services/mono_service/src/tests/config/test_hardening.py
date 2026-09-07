"""Operational hardening ported from the narrative engine.

Covers the three things mono_service was missing relative to that service:
redacted structured logging, request rate limiting, and fail-fast production
configuration validation.
"""
import logging

import pytest

from src.config.logging_config import (
    RedactingFormatter,
    configure_logging,
    get_logger,
    redact_sensitive_data,
)
from src.config.settings import validate_production_config


# ---------------------------------------------------------------------------
# Redaction — the reason this replaced print()
# ---------------------------------------------------------------------------

def _format(msg: str) -> str:
    formatter = RedactingFormatter("%(message)s")
    record = logging.LogRecord("mono", logging.INFO, __file__, 1, msg, None, None)
    return formatter.format(record)


def test_xrpl_wallet_addresses_are_redacted():
    out = _format("paying rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH for task_1")
    assert "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH" not in out
    assert "[REDACTED_WALLET]" in out


def test_bearer_tokens_are_redacted():
    out = _format("calling with Authorization: Bearer abc.def-123_XYZ")
    assert "abc.def-123_XYZ" not in out
    assert "Bearer [REDACTED_TOKEN]" in out


def test_bare_firebase_id_tokens_are_redacted():
    out = _format("token=eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMyJ9payload")
    assert "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMyJ9" not in out
    assert "[REDACTED_JWT]" in out


def test_keyed_secrets_in_json_are_redacted():
    out = _format('{"secret":"hunter2","other":"fine"}')
    assert "hunter2" not in out
    assert "fine" in out


@pytest.mark.parametrize(
    "field", ["password", "token", "secret", "private_key", "api_key",
              "user_token", "pin", "pin_hash", "id_token"],
)
def test_sensitive_dict_fields_are_redacted(field):
    assert redact_sensitive_data({field: "value"})[field] == "[REDACTED]"


def test_redaction_reaches_nested_structures():
    payload = {"outer": {"items": [{"user_token": "abc"}]}, "keep": "visible"}
    result = redact_sensitive_data(payload)
    assert result["outer"]["items"][0]["user_token"] == "[REDACTED]"
    assert result["keep"] == "visible"


def test_non_sensitive_values_survive():
    assert redact_sensitive_data({"task_id": "task_1"})["task_id"] == "task_1"


# ---------------------------------------------------------------------------
# Logger wiring
# ---------------------------------------------------------------------------

def test_configure_logging_is_idempotent():
    """Called at import time; a reload must not stack duplicate handlers."""
    first = configure_logging()
    count = len(first.handlers)
    assert count >= 1
    assert len(configure_logging().handlers) == count


def test_module_loggers_are_children_of_the_service_logger():
    assert get_logger("src.storage.user_db").name.startswith("mono.")


def test_the_converted_modules_expose_a_logger_not_print():
    """Guards the print() -> logger conversion from being partially undone."""
    import src.storage.user_db as user_db
    import src.services.tasks.task_service as task_service
    import src.storage.firestore_db as firestore_db

    for module in (user_db, task_service, firestore_db):
        assert isinstance(module.logger, logging.Logger)


# ---------------------------------------------------------------------------
# Production configuration validation
# ---------------------------------------------------------------------------

def test_validation_is_a_noop_outside_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.delenv("FIREBASE_PROJECT_ID", raising=False)
    validate_production_config()


def test_production_startup_fails_when_config_is_missing(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    for var in ("FIREBASE_PROJECT_ID", "INTERNAL_SERVICE_TOKEN",
                "XRPL_SERVICE_URL", "CORS_ORIGINS"):
        monkeypatch.delenv(var, raising=False)

    with pytest.raises(ValueError) as exc:
        validate_production_config()
    assert "FIREBASE_PROJECT_ID" in str(exc.value)


def test_the_reward_pipeline_secret_is_a_required_production_var(monkeypatch):
    """Internal auth fails closed, so a missing token silently breaks
    settlement hours later. It has to be caught at startup."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "p")
    monkeypatch.setenv("XRPL_SERVICE_URL", "http://x")
    monkeypatch.setenv("CORS_ORIGINS", "http://y")
    monkeypatch.delenv("INTERNAL_SERVICE_TOKEN", raising=False)

    with pytest.raises(ValueError) as exc:
        validate_production_config()
    assert "INTERNAL_SERVICE_TOKEN" in str(exc.value)


def test_production_startup_passes_when_fully_configured(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    for var in ("FIREBASE_PROJECT_ID", "INTERNAL_SERVICE_TOKEN",
                "XRPL_SERVICE_URL", "CORS_ORIGINS"):
        monkeypatch.setenv(var, "set")
    validate_production_config()


# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------

class _FakeClient:
    def __init__(self, host):
        self.host = host


class _FakeURL:
    def __init__(self, path):
        self.path = path


class _FakeRequest:
    def __init__(self, path="/api/tasks/", host="1.2.3.4"):
        self.url = _FakeURL(path)
        self.client = _FakeClient(host)


async def _ok(_request):
    return "passed-through"


@pytest.mark.asyncio
async def test_requests_under_the_limit_pass_through():
    from src.config.rate_limit import RateLimitMiddleware

    mw = RateLimitMiddleware(app=None, max_requests=3, window_seconds=60)
    for _ in range(3):
        assert await mw.dispatch(_FakeRequest(), _ok) == "passed-through"


@pytest.mark.asyncio
async def test_exceeding_the_limit_returns_429():
    from src.config.rate_limit import RateLimitMiddleware

    mw = RateLimitMiddleware(app=None, max_requests=2, window_seconds=60)
    await mw.dispatch(_FakeRequest(), _ok)
    await mw.dispatch(_FakeRequest(), _ok)
    response = await mw.dispatch(_FakeRequest(), _ok)
    assert response.status_code == 429


@pytest.mark.asyncio
async def test_the_limit_is_per_client_not_global():
    from src.config.rate_limit import RateLimitMiddleware

    mw = RateLimitMiddleware(app=None, max_requests=1, window_seconds=60)
    await mw.dispatch(_FakeRequest(host="1.1.1.1"), _ok)
    # A second client must not be punished for the first one's traffic.
    assert await mw.dispatch(_FakeRequest(host="2.2.2.2"), _ok) == "passed-through"


@pytest.mark.asyncio
async def test_the_window_slides():
    from src.config.rate_limit import RateLimitMiddleware

    mw = RateLimitMiddleware(app=None, max_requests=1, window_seconds=60)
    await mw.dispatch(_FakeRequest(), _ok)
    assert (await mw.dispatch(_FakeRequest(), _ok)).status_code == 429

    # Age the recorded timestamps past the window.
    mw.requests["1.2.3.4"] = [t - 61 for t in mw.requests["1.2.3.4"]]
    assert await mw.dispatch(_FakeRequest(), _ok) == "passed-through"


@pytest.mark.asyncio
@pytest.mark.parametrize("path", ["/health", "/", "/openapi.json", "/docs", "/redoc"])
async def test_health_and_docs_are_exempt(path):
    """Cloud Run probes must never be throttled."""
    from src.config.rate_limit import RateLimitMiddleware

    mw = RateLimitMiddleware(app=None, max_requests=1, window_seconds=60)
    for _ in range(5):
        assert await mw.dispatch(_FakeRequest(path=path), _ok) == "passed-through"
