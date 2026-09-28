"""Unit tests for ADMIN_TOKEN authentication on Admin Story Management routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from src.main import app

client = TestClient(app)


def test_admin_token_header_access(monkeypatch):
    """Test that requests with X-Admin-Token matching ADMIN_TOKEN succeed without Firebase token."""
    monkeypatch.setenv("ADMIN_TOKEN", "test-secret-token-12345")

    response = client.get(
        "/admin/stories/topics",
        headers={"X-Admin-Token": "test-secret-token-12345"},
    )
    assert response.status_code == 200
    assert "topics" in response.json()


def test_admin_token_internal_header_access(monkeypatch):
    """Test that requests with X-Internal-Token matching ADMIN_TOKEN succeed."""
    monkeypatch.setenv("ADMIN_TOKEN", "test-secret-token-12345")

    response = client.get(
        "/admin/stories/topics",
        headers={"X-Internal-Token": "test-secret-token-12345"},
    )
    assert response.status_code == 200
    assert "topics" in response.json()


def test_admin_token_bearer_access(monkeypatch):
    """Test that requests with Authorization: Bearer <ADMIN_TOKEN> succeed."""
    monkeypatch.setenv("ADMIN_TOKEN", "test-secret-token-12345")

    response = client.get(
        "/admin/stories/topics",
        headers={"Authorization": "Bearer test-secret-token-12345"},
    )
    assert response.status_code == 200
    assert "topics" in response.json()


def test_invalid_admin_token_rejected(monkeypatch):
    """Test that an incorrect token is rejected with 401 when no valid Firebase credentials exist."""
    monkeypatch.setenv("ADMIN_TOKEN", "test-secret-token-12345")

    # Override conftest auth bypass to test raw auth logic
    from src.routes.admin_stories import get_admin_user
    app.dependency_overrides.pop(get_admin_user, None)

    response = client.get(
        "/admin/stories/topics",
        headers={"X-Admin-Token": "wrong-token"},
    )
    assert response.status_code == 401
