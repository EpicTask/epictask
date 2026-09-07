"""Startup configuration validation.

Ported from `adaptive_narrative_engine/src/config/settings.py`. The point is to
fail at startup rather than at the point of use: a missing
INTERNAL_SERVICE_TOKEN, for instance, does not break anything until a Xumm
webhook arrives hours later, at which point settlement silently rejects every
call because internal auth fails closed.
"""
import os


def validate_production_config() -> None:
    """Raise if required production configuration is missing.

    No-op outside production so local and test runs are unaffected.
    """
    env = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower()
    if env != "production":
        return

    required_vars = [
        "FIREBASE_PROJECT_ID",
        # Guards /api/internal/* (reward settlement, scheduled jobs) and
        # /api/xrpl/log. Auth fails closed, so without this the reward pipeline
        # rejects every settlement report.
        "INTERNAL_SERVICE_TOKEN",
        # Without this, task verification cannot request a payment.
        "XRPL_SERVICE_URL",
        "CORS_ORIGINS",
    ]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(
            "Missing required production configuration variables: "
            + ", ".join(missing)
        )
