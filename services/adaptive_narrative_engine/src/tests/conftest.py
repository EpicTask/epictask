"""
Shared pytest fixtures for the adaptive narrative engine test suite.

Auth is bypassed here through FastAPI's dependency-override mechanism rather
than through a magic token string baked into production code. The routes are
exercised as an authenticated admin, which is what the previous `fake_token`
bypass in src/config/security.py used to return.
"""
import pytest

from src.config.security import get_current_user
from src.main import app

TEST_USER = {"uid": "user_123", "role": "admin", "admin": True}


@pytest.fixture(autouse=True)
def override_auth():
    """Run every request as TEST_USER unless a test overrides it itself."""
    app.dependency_overrides[get_current_user] = lambda: dict(TEST_USER)
    yield
    app.dependency_overrides.pop(get_current_user, None)
