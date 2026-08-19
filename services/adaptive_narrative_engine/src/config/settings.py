"""Production settings and configuration validation."""
import os


def validate_production_config() -> None:
    """
    Validate required production configuration settings.
    Raises ValueError if critical environment variables are missing when ENVIRONMENT is production.
    """
    env = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower()
    if env != "production":
        return

    required_vars = [
        "FIREBASE_PROJECT_ID",
        "PUBSUB_INTERNAL_TOKEN",
        "XRPL_SERVICE_URL",
        "CORS_ORIGINS",
    ]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(f"Missing required production configuration variables: {', '.join(missing)}")
