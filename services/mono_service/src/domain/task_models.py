from pydantic import BaseModel
from typing import Optional, List


class TaskEvent(BaseModel):
    """Task event schema"""
    event_id: str
    event_type: str
    timestamp: str
    task_id: str
    user_id: str
    status: str
    additional_data: Optional[dict]

class TaskCreated(BaseModel):
    """Task created schema"""
    task_description: str
    task_id: str
    expiration_date: int
    payment_method: str # Pay Directly or Escrow/Smart Contract
    reward_amount: float
    reward_currency: str
    user_id: str
    assigned_to_ids: List[str] = None
    auto_verify: bool = None
    marked_completed: bool = None
    project_id: str = None
    project_name: str = None
    rating: int = None
    requires_attachments: bool = False
    rewarded: bool = None
    task_title: str = None
    terms_blob: str = None
    terms_id: str = None
    smart_contract_enabled: bool = None
    status: str = None # pending, completed, verified, expired, cancelled


class TaskAssigned(BaseModel):
    """Task assigned schema"""
    task_id: str
    assigned_to_id: str


class TaskCancelled(BaseModel):
    """Task cancelled schema"""
    task_id: str


class TaskCommentAdded(BaseModel):
    """Task comment added schema"""
    task_id: str
    user_id: str
    comment: str


class TaskCompleted(BaseModel):
    """Task completed schema"""
    task_id: str
    completed_by_id: str
    attachments: List[str] = None
    marked_completed: bool = None
    verified: bool = None
    verification_method: str = None


class TaskExpired(BaseModel):
    """Task expired schema"""
    task_id: str


class TaskRatingUpdate(BaseModel):
    """Task rating update schema"""
    task_id: str
    user_id: str


class TaskRewarded(BaseModel):
    """Task rewarded schema"""
    task_id: str
    user_id: str


class TaskUpdated(BaseModel):
    """Task updated schema"""
    task_id: str
    updated_fields: dict
    user_id: str

class TaskVerified(BaseModel):
    """Task verified schema"""
    task_id: str
    verified: bool
    verification_method: str # user or verifi
    user_id: str

# Enhanced Leaderboard and Rewards Schemas
class LeaderboardEntry(BaseModel):
    """Enhanced leaderboard entry schema with token-only support"""
    user_id: str
    display_name: str = ""
    tasks_completed: int
    xrp_earned: float = 0.0
    rlusd_earned: float = 0.0
    eTask_earned: float = 0.0
    token_score: float = 0.0
    level: int = 1
    global_rank: int = 0
    family_rank: int = 0
    last_updated: Optional[str] = None

class ComprehensiveRewards(BaseModel):
    """Comprehensive rewards schema for enhanced UI - token-only"""
    user_id: str
    display_name: str = ""
    currencies: dict = {
        "xrp_earned": 0.0,
        "rlusd_earned": 0.0,
        "etask_earned": 0.0
    }
    tasks_completed: int = 0
    level: int = 1
    family_rank: int = 0
    global_rank: int = 0
    token_score: float = 0.0
    achievements: List[str] = []
    next_level_progress: float = 0.0
    family_id: Optional[str] = None

class FamilyLeaderboard(BaseModel):
    """Family leaderboard schema for parent view - token-only"""
    family_id: str
    parent_id: str
    children: List[ComprehensiveRewards]
    family_total_tokens: float = 0.0
    family_total_tasks: int = 0
    family_global_rank: int = 0

class KidLeaderboardView(BaseModel):
    """Kid-specific leaderboard view schema"""
    kid_data: ComprehensiveRewards
    family_position: int
    family_total_kids: int
    encouragement_message: str
    next_milestone: dict
    global_context: dict

class UserRewards(BaseModel):
    """Legacy user rewards schema - maintained for backward compatibility"""
    user_id: str
    tokens_earned: float
    level: int
    rank: int

class TaskSummary(BaseModel):
    """Task summary schema"""
    completed: int
    in_progress: int
    total: int
