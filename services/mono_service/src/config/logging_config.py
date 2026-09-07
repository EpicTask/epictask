"""Structured logging with sensitive-data redaction.

Ported from `adaptive_narrative_engine/src/config/logging_config.py` so the two
Python services log the same way and there is one redaction policy to maintain,
not two. Keep them in sync; if you extend the patterns here, extend them there.

Why this exists: mono_service previously used 45 bare `print()` calls. On Cloud
Run those arrive as unstructured text with no severity, so they cannot be
alerted on or filtered — and several printed user IDs, which for this product
means children's identifiers sitting in plaintext logs.
"""
import logging
import os
import re
from typing import Any


class RedactingFormatter(logging.Formatter):
    """Formatter that redacts tokens, wallet addresses and keyed secrets."""

    REDACT_PATTERNS = [
        # XRPL classic addresses.
        (re.compile(r'r[1-9A-HJ-NP-Za-km-z]{25,34}'), '[REDACTED_WALLET]'),
        (re.compile(r'Bearer\s+[A-Za-z0-9._-]+', re.I), 'Bearer [REDACTED_TOKEN]'),
        (re.compile(r'("?(?:password|token|secret|key)"?\s*[:=]\s*")[^"]+(")'), r'\1[REDACTED]\2'),
        # Firebase ID tokens / JWTs appearing bare rather than behind "Bearer".
        (re.compile(r'\beyJ[A-Za-z0-9._-]{20,}'), '[REDACTED_JWT]'),
    ]

    def format(self, record: logging.LogRecord) -> str:
        formatted = super().format(record)
        for pattern, replacement in self.REDACT_PATTERNS:
            formatted = pattern.sub(replacement, formatted)
        return formatted


def redact_sensitive_data(data: Any) -> Any:
    """Redact sensitive fields from a string or nested dict before logging."""
    if isinstance(data, str):
        for pattern, replacement in RedactingFormatter.REDACT_PATTERNS:
            data = pattern.sub(replacement, data)
        return data
    if isinstance(data, dict):
        redacted = {}
        for k, v in data.items():
            if k.lower() in (
                "password", "token", "secret", "private_key", "api_key",
                "user_token", "pin", "pin_hash", "id_token",
            ):
                redacted[k] = "[REDACTED]"
            else:
                redacted[k] = redact_sensitive_data(v)
        return redacted
    if isinstance(data, list):
        return [redact_sensitive_data(item) for item in data]
    return data


def configure_logging(level: int | None = None) -> logging.Logger:
    """Configure the service logger. Call once, at import time in main."""
    if level is None:
        level = logging.DEBUG if os.getenv("DEBUG", "").lower() == "true" else logging.INFO

    logger = logging.getLogger("mono")
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(
            RedactingFormatter('%(asctime)s [%(levelname)s] %(name)s - %(message)s')
        )
        logger.addHandler(handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """Child logger for a module: `get_logger(__name__)`."""
    return logging.getLogger("mono").getChild(name.rsplit(".", 1)[-1])
