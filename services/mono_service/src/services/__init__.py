"""
Service layer initialization.
Exposes service instances for all domains.
"""


# Task Services
from .tasks.task_service import task_service
from .tasks.leaderboard_service import leaderboard_service

# User Services
from .users.user_service import user_service

__all__ = [
    'task_service',
    'leaderboard_service',
    'user_service'
]
