"""Rate limiting middleware for API abuse protection.

Ported from `adaptive_narrative_engine/src/config/rate_limit.py`. Keep the two
in sync rather than letting them diverge.

Caveat worth knowing before you rely on it: the window is in-memory and
per-instance, so with N Cloud Run instances the effective limit is N x
max_requests, and it resets on cold start. It is abuse dampening, not a quota.
A shared store (Redis, already in docker-compose) is the upgrade path.
"""
import time
from collections import defaultdict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory sliding window rate limiter middleware."""

    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Exempt health check and root UI
        if request.url.path in ["/health", "/", "/openapi.json", "/docs", "/redoc"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old requests
        timestamps = [t for t in self.requests[client_ip] if t > window_start]

        if len(timestamps) >= self.max_requests:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Too many requests."}
            )

        timestamps.append(now)
        self.requests[client_ip] = timestamps

        return await call_next(request)
