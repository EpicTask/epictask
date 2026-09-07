"""Reward crediting. The single write path into the reward ledger.

Everything that grants earnings goes through here — task approval today,
narrative payouts and settlement next. If you find yourself writing to the
reward ledger from somewhere else, that is the bug this module exists to
prevent (see the working agreements in CLAUDE.md).
"""
from typing import Any, Dict, Optional

from ...domain.reward_models import RewardEvent, RewardSource, RewardState
from ...storage import reward_db


class RewardCreditError(Exception):
    """Raised when a task cannot be credited. Never swallowed by callers."""


def _require(task: Dict[str, Any], field: str) -> Any:
    value = task.get(field)
    if value in (None, "", [], {}):
        raise RewardCreditError(
            f"task {task.get('task_id')!r} cannot be credited: missing {field}"
        )
    return value


def credit_task(task: Dict[str, Any], state: RewardState = RewardState.PENDING,
                tx_hash: Optional[str] = None) -> Dict[str, str]:
    """Credit every assignee of a task.

    Reads the amount, currency and assignees from the **task document** rather
    than from a request model. The previous implementation took them off
    `TaskVerified`/`TaskRewarded`, which carry none of those fields, so it
    raised `AttributeError` on its first line for every call ever made.

    `PENDING` means the parent approved; the money has not moved. `SETTLED` is
    written later from a confirmed ledger transaction.
    """
    task_id = _require(task, "task_id")
    assignee_ids = _require(task, "assigned_to_ids")
    amount = task.get("reward_amount")
    currency = _require(task, "reward_currency")

    if amount is None:
        raise RewardCreditError(
            f"task {task_id!r} cannot be credited: missing reward_amount"
        )

    results: Dict[str, str] = {}
    for user_id in assignee_ids:
        # Scoped per assignee so a multi-assignee task is idempotent per child.
        source_id = f"{task_id}:{user_id}" if len(assignee_ids) > 1 else str(task_id)
        event = RewardEvent(
            event_id=RewardEvent.make_id(source_id, state),
            user_id=user_id,
            source=RewardSource.TASK,
            source_id=source_id,
            state=state,
            amount=float(amount),
            currency=currency,
            tx_hash=tx_hash,
        )
        results[user_id] = reward_db.append_reward_event(event)

    return results


def get_rewards(user_id: str) -> Dict[str, Any]:
    """Projection for one user."""
    return reward_db.get_projection(user_id)


def rebuild(user_id: str) -> Dict[str, Any]:
    """Force a projection rebuild. Safe to call at any time."""
    return reward_db.rebuild_projection(user_id)
