"""
Domain models for the Monorepo Service.
Combines models from Narrative Engine, Task Management, and User Management.
"""

from .narrative_models import (
    Story,
    NodeOption,
    PayoutHint,
    StoryNode,
    StoryProgress,
    AdvanceRequest,
    AdvanceResponse,
    NarrativeAward,
    PayoutRequest,
    PayoutRequestRecord,
    UserProfile as NarrativeUserProfile,
    RecommendRequest,
    RecommendResponse,
    ParentNarrativeSettings,
    KidProgressSummary,
    PayoutApprovalRequest,
    PayoutApprovalResponse,
    HealthResponse
)

from .task_models import (
    TaskEvent,
    TaskCreated,
    TaskAssigned,
    TaskCancelled,
    TaskCommentAdded,
    TaskCompleted,
    TaskExpired,
    TaskRatingUpdate,
    TaskRewarded,
    TaskUpdated,
    TaskVerified,
    LeaderboardEntry,
    ComprehensiveRewards,
    FamilyLeaderboard,
    KidLeaderboardView,
    UserRewards,
    TaskSummary
)

from .user_models import (
    UserProfile,
    UserProfileUpdate,
    InviteCodeRequest,
    InviteCodeResponse,
    LinkChildRequest,
    UserMetrics,
    UserEvent
)
