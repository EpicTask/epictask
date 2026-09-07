"""Leaderboard queries.

A thin pass-through to the reward domain, which owns both the ledger and the
views built from it. Keeping the logic there rather than here is deliberate:
reward reads and reward writes have to agree about scoring, and they can only
do that if they share one definition of it.
"""
from typing import Any, Dict

from ..rewards import reward_views


class LeaderboardService:
    """Service for managing leaderboards."""

    async def get_family_leaderboard(self, parent_id: str) -> Any:
        """Family leaderboard for the parent view."""
        return reward_views.get_family_leaderboard(parent_id)

    async def get_kid_leaderboard_view(self, kid_id: str) -> Any:
        """Kid-specific leaderboard view."""
        return reward_views.get_kid_leaderboard_view(kid_id)

    async def get_enhanced_global_leaderboard(self, limit: int = 100) -> Dict[str, Any]:
        """Global leaderboard ordered by settled token score."""
        return reward_views.get_global_leaderboard(limit)


leaderboard_service = LeaderboardService()
