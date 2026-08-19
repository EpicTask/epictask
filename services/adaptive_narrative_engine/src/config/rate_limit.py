"""Rate limiting middleware for API abuse protection."""
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
        if request.url.path in ["/health", "/", "/openapi.json", "/docs"]:
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
