"""Reward domain models.

The reward ledger is append-only. `RewardEvent` is the record of truth; the
per-user document in the leaderboard collection is a *projection* derived by
replaying that user's events, and can be rebuilt at any time.

Two properties matter and are easy to lose in a refactor:

1. **Deterministic event IDs.** `{source_id}:{state}` means a retried or
   duplicated credit collapses onto the same document instead of adding a
   second one. Verification and payment are both retryable, so this is load
   bearing, not defensive.
2. **The projection sums events; it never increments.** A duplicate write at
   the same ID therefore cannot double-count, which is what removes the
   read-modify-write race the old `update_enhanced_leaderboard` had.
"""
from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel, Field, field_validator


class RewardState(str, Enum):
    """Lifecycle of a single credit.

    `PENDING` and `SETTLED` are deliberately distinct: a parent approving a
    task does not move XRP. Settlement needs the parent to sign in Xumm, which
    may take days or never happen. Collapsing the two would show a child a
    balance that does not exist.
    """

    PENDING = "pending"
    SETTLED = "settled"
    VOIDED = "voided"


class RewardSource(str, Enum):
    """Where a credit came from. Both streams share one ledger."""

    TASK = "task"
    NARRATIVE = "narrative"


# Canonical currency codes. Stored uppercase so a projection cannot end up with
# both "eTask" and "ETASK" buckets for the same child.
SUPPORTED_CURRENCIES = ("XRP", "RLUSD", "ETASK")


class RewardEvent(BaseModel):
    """One credit. Append-only: never updated in place, never deleted."""

    event_id: str
    user_id: str
    source: RewardSource
    source_id: str
    state: RewardState
    amount: float = Field(ge=0)
    currency: str
    created_at: Optional[str] = None
    # Present on SETTLED events written from a confirmed ledger transaction.
    tx_hash: Optional[str] = None

    @field_validator("currency")
    @classmethod
    def _normalise_currency(cls, v: str) -> str:
        code = (v or "").strip().upper()
        if code not in SUPPORTED_CURRENCIES:
            raise ValueError(
                f"unsupported reward currency {v!r}; expected one of {SUPPORTED_CURRENCIES}"
            )
        return code

    @staticmethod
    def make_id(source_id: str, state: "RewardState | str") -> str:
        """The deterministic document ID. See module docstring."""
        state_value = state.value if isinstance(state, RewardState) else str(state)
        return f"{source_id}:{state_value}"


class CurrencyTotals(BaseModel):
    """Per-currency split. `pending` is approved-but-unsettled."""

    pending: float = 0.0
    settled: float = 0.0


# Token score weights. Preserved from the previous implementation so this change
# is behaviour-neutral on scoring.
#
# TODO(rewards): revisit. Weighting XRP at 0.3 makes one XRP count for less than
# one eTask point, which is inverted relative to real value. Reward data starts
# from zero, so changing these is free right now and gets expensive later.
CURRENCY_WEIGHTS = {"XRP": 0.3, "RLUSD": 1.0, "ETASK": 1.0}

# One level per 1000 points of settled score.
LEVEL_STEP = 1000.0


class RewardProjection(BaseModel):
    """Derived per-user totals. Rebuildable; never the record of truth.

    `token_score`, `level` and `level_progress` are computed from **settled**
    credits only, so a rank or level can never be inflated by a payment the
    parent never signed. Pending amounts are carried separately for display.
    """

    user_id: str
    currencies: Dict[str, CurrencyTotals] = Field(default_factory=dict)
    tasks_settled: int = 0
    tasks_pending: int = 0
    token_score: float = 0.0
    level: int = 1
    # Percent of the way from `level` to `level + 1`. Derived from the same
    # score as `level`, so unlike the previous implementation it cannot be
    # pinned at 0 by a level earned through a different unit.
    level_progress: float = 0.0
    updated_at: Optional[str] = None


def token_score(currencies: Dict[str, CurrencyTotals]) -> float:
    """Weighted score across settled balances."""
    total = 0.0
    for code, totals in currencies.items():
        total += totals.settled * CURRENCY_WEIGHTS.get(code.upper(), 1.0)
    return round(total, 2)


def level_for(score: float) -> int:
    """Level as a pure function of score, so progress stays consistent."""
    return int(max(0.0, score) // LEVEL_STEP) + 1


def level_progress_for(score: float) -> float:
    """Percent toward the next level, from the same score as `level_for`."""
    if score <= 0:
        return 0.0
    return round((score % LEVEL_STEP) / LEVEL_STEP * 100, 2)
