"""Pydantic models for Adaptive Narrative Engine."""
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator


# Story Models
class Story(BaseModel):
    """Story metadata model."""
    story_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    age_min: int = Field(ge=5, le=18)
    age_max: int = Field(ge=5, le=18)
    tags: List[str] = Field(default_factory=list)
    version: int = Field(default=1, ge=1)
    published: bool = Field(default=False)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @field_validator('age_max')
    @classmethod
    def validate_age_range(cls, v, info):
        """Ensure age_max is greater than or equal to age_min."""
        if 'age_min' in info.data and v < info.data['age_min']:
            raise ValueError('age_max must be greater than or equal to age_min')
        return v


class NodeOption(BaseModel):
    """Choice option within a story node."""
    text: str
    leads_to: str  # Next node ID
    reward_xp: int = Field(default=0, ge=0)


class PayoutHint(BaseModel):
    """Payout hint for chapter completion."""
    token: Literal["eTask", "RLUSD", "XRP"]
    amount_min: float = Field(ge=0)
    amount_max: float = Field(ge=0)
    
    @field_validator('amount_max')
    @classmethod
    def validate_amount_range(cls, v, info):
        """Ensure amount_max is greater than or equal to amount_min."""
        if 'amount_min' in info.data and v < info.data['amount_min']:
            raise ValueError('amount_max must be greater than or equal to amount_min')
        return v


class StoryNode(BaseModel):
    """Individual story node (scene/chapter)."""
    node_id: Optional[str] = None
    title: str
    lesson_key: str
    age_range: List[int] = Field(min_length=2, max_length=2)
    prompt: str
    options: List[NodeOption]
    payout_hint: Optional[PayoutHint] = None
    is_terminal: bool = Field(default=False)
    order: int = Field(default=0, ge=0)
    
    @field_validator('age_range')
    @classmethod
    def validate_age_range_list(cls, v):
        """Ensure age_range is [min, max] with min <= max."""
        if len(v) != 2:
            raise ValueError('age_range must have exactly 2 elements [min, max]')
        if v[0] > v[1]:
            raise ValueError('age_range[0] must be <= age_range[1]')
        if v[0] < 5 or v[1] > 18:
            raise ValueError('age_range must be between 5 and 18')
        return v


# Progress Models
class StoryProgress(BaseModel):
    """User progress for a specific story."""
    user_id: str
    story_id: str
    current_node: str
    completed_nodes: List[str] = Field(default_factory=list)
    total_xp: int = Field(default=0, ge=0)
    level: int = Field(default=1, ge=1)
    preferred_topics: List[str] = Field(default_factory=list)
    started_at: Optional[datetime] = None
    last_updated: Optional[datetime] = None


class AdvanceRequest(BaseModel):
    """Request to advance story progress."""
    user_id: str
    story_id: str
    current_node_id: str
    choice_index: int = Field(ge=0)
    age: int = Field(ge=5, le=18)


class AdvanceResponse(BaseModel):
    """Response after advancing story progress."""
    next_node_id: str
    xp_awarded: int
    payout_candidate: Optional[PayoutHint] = None
    level_up: bool = Field(default=False)
    new_level: Optional[int] = None


# Award Models
class NarrativeAward(BaseModel):
    """Award/achievement for story completion."""
    award_id: Optional[str] = None
    user_id: str
    story_id: str
    node_id: str
    xp: int = Field(ge=0)
    badge: Optional[str] = None
    created_at: Optional[datetime] = None


# Payout Models
class PayoutRequest(BaseModel):
    """Request to create a payout."""
    user_id: str
    wallet_address: str
    token: Literal["eTask", "RLUSD", "XRP"]
    amount: float = Field(gt=0)
    reason: Literal["chapter_completion", "story_completion", "streak_bonus", "milestone"]
    story_id: Optional[str] = None
    node_id: Optional[str] = None


class PayoutRequestRecord(BaseModel):
    """Payout request record in Firestore."""
    request_id: Optional[str] = None
    user_id: str
    wallet_address: str
    token: Literal["eTask", "RLUSD", "XRP"]
    amount: float
    reason: str
    story_id: Optional[str] = None
    node_id: Optional[str] = None
    status: Literal["pending", "submitted", "confirmed", "failed"] = Field(default="pending")
    correlation_id: Optional[str] = None
    transaction_hash: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    error_message: Optional[str] = None


# Recommender Models
class UserProfile(BaseModel):
    """User profile for recommendation engine."""
    user_id: str
    age: int = Field(ge=5, le=18)
    level: int = Field(default=1, ge=1)
    preferred_topics: List[str] = Field(default_factory=list)
    completed_lessons: List[str] = Field(default_factory=list)


class RecommendRequest(BaseModel):
    """Request to lesson recommender service."""
    user_id: str
    age: int = Field(ge=5, le=18)
    story_id: str
    current_node_id: str
    history: List[str] = Field(default_factory=list)
    candidate_nodes: List[str]
    profile: Optional[UserProfile] = None


class RecommendResponse(BaseModel):
    """Response from lesson recommender service."""
    next_node_id: str
    confidence: float = Field(ge=0, le=1)
    rationale: Optional[str] = None


# Parent Models
class ParentNarrativeSettings(BaseModel):
    """Parent settings for narrative features per kid."""
    kid_id: str
    payouts_enabled: bool = Field(default=False)
    parent_wallet_address: Optional[str] = None
    daily_payout_limit: float = Field(default=10.0, ge=0)
    max_payouts_per_day: int = Field(default=3, ge=0)
    require_manual_approval: bool = Field(default=True)
    allowed_topics: List[str] = Field(default_factory=list)
    blocked_topics: List[str] = Field(default_factory=list)
    min_age_content: Optional[int] = Field(default=None, ge=5, le=18)
    max_age_content: Optional[int] = Field(default=None, ge=5, le=18)
    notification_on_progress: bool = Field(default=True)
    notification_on_payout: bool = Field(default=True)
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None  # Parent user ID


class KidProgressSummary(BaseModel):
    """Summary of a kid's narrative progress."""
    kid_id: str
    kid_name: Optional[str] = None
    stories_started: int = Field(default=0, ge=0)
    stories_completed: int = Field(default=0, ge=0)
    total_xp_earned: int = Field(default=0, ge=0)
    total_payouts: int = Field(default=0, ge=0)
    total_payout_amount: float = Field(default=0.0, ge=0)
    last_activity_at: Optional[datetime] = None
    current_stories: List[dict] = Field(default_factory=list)


class PayoutApprovalRequest(BaseModel):
    """Request to approve or reject a payout."""
    request_id: str
    action: Literal["approve", "reject"]
    reason: Optional[str] = None


class PayoutApprovalResponse(BaseModel):
    """Response after approving/rejecting a payout."""
    request_id: str
    status: str
    message: str
    transaction_hash: Optional[str] = None


# API Response Models
class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    timestamp: datetime
