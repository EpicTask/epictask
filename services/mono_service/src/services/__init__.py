"""
Service layer initialization.
Exposes service instances for all domains.
"""

# Narrative Services
from .narrative.llm_service import llm_service
from .narrative.story_generator_service import story_generator
from .narrative.parent_service import parent_service
from .narrative.recommender_client import recommender_client

# Task Services
from .tasks.task_service import task_service
from .tasks.leaderboard_service import leaderboard_service

# User Services
from .users.user_service import user_service

__all__ = [
    'llm_service',
    'story_generator',
    'parent_service',
    'recommender_client',
    'task_service',
    'leaderboard_service',
    'user_service'
]
