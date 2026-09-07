"""Reward domain models.

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


# Token score weights: how many score points one unit of each currency is worth.
#
# These match the normalisation the achievement thresholds have always used
# (`xrp + rlusd + etask/100`), which is the closest thing this project has to a
# stated intent. XRP was previously weighted 0.3, which made one XRP worth less
# than one eTask point — inverted against both real value and the achievement
# code it sat next to. RLUSD is the anchor at 1.0.
#
# If you later want value-accurate weighting, XRP should track its USD rate,
# which belongs in configuration rather than a module constant: a market price
# frozen into source goes stale silently.
CURRENCY_WEIGHTS = {"XRP": 1.0, "RLUSD": 1.0, "ETASK": 0.01}

# Score points per level.
#
# Tied to the weights above: with eTask at 0.01 a step of 1000 would have needed
# 100,000 eTask to reach level 2, freezing every child at level 1. The
# achievement ladder treats 1 -> 100 normalised points as the meaningful range
# ("First Earnings" at 1, "Token Legend" at 100), so a step of 10 puts levels
# 1-11 across that span and keeps the level badges in the kid view reachable.
LEVEL_STEP = 10.0

# How long a PENDING credit may sit unsettled before it is voided.
#
# Settlement needs the parent to sign in Xumm, which may never happen — an
# unlinked wallet means it cannot. Without expiry a child keeps a balance that
# will never arrive.
#
# NOT YET ENFORCED: the scheduled job that voids expired credits is Phase 6.
# The window is recorded here so the decision is not lost.
PENDING_EXPIRY_DAYS = 3


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
