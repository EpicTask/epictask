"""Tests for general API rate limiting."""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from src.config.rate_limit import RateLimitMiddleware


def test_rate_limit_exceeded():
    """Test that exceeding the rate limit returns HTTP 429."""
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware, max_requests=2, window_seconds=60)

    @app.get("/test")
    def test_endpoint():
        return {"status": "ok"}

    client = TestClient(app)

    # First two requests succeed
    res1 = client.get("/test")
    assert res1.status_code == 200

    res2 = client.get("/test")
    assert res2.status_code == 200

    # Third request exceeds limit -> 429
    res3 = client.get("/test")
    assert res3.status_code == 429
    assert "Rate limit exceeded" in res3.json()["detail"]
