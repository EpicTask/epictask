"""Structured logging configuration with sensitive data redaction."""
import logging
import re
from typing import Any


class RedactingFormatter(logging.Formatter):
    """Formatter that redacts sensitive information like tokens, wallets, user keys."""

    REDACT_PATTERNS = [
        (re.compile(r'r[1-9A-HJ-NP-Za-km-z]{25,34}'), '[REDACTED_WALLET]'),
        (re.compile(r'Bearer\s+[A-Za-z0-9._-]+', re.I), 'Bearer [REDACTED_TOKEN]'),
        (re.compile(r'("?(?:password|token|secret|key)"?\s*[:=]\s*")[^"]+(")'), r'\1[REDACTED]\2'),
    ]

    def format(self, record: logging.LogRecord) -> str:
        formatted = super().format(record)
        for pattern, replacement in self.REDACT_PATTERNS:
            formatted = pattern.sub(replacement, formatted)
        return formatted


def redact_sensitive_data(data: Any) -> Any:
    """Helper function to redact sensitive fields from dicts/strings."""
    if isinstance(data, str):
        for pattern, replacement in RedactingFormatter.REDACT_PATTERNS:
            data = pattern.sub(replacement, data)
        return data
    elif isinstance(data, dict):
        redacted = {}
        for k, v in data.items():
            if k.lower() in ("password", "token", "secret", "private_key", "api_key"):
                redacted[k] = "[REDACTED]"
            else:
                redacted[k] = redact_sensitive_data(v)
        return redacted
    return data


def configure_logging(level: int = logging.INFO) -> logging.Logger:
    """Configure structured, redacted logging."""
    logger = logging.getLogger("ane")
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = RedactingFormatter(
            '%(asctime)s [%(levelname)s] %(name)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
