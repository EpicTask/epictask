from pydantic import BaseModel
from typing import Optional, List


class TaskEvent(BaseModel):
    event_id: str
    event_type: str
    timestamp: str
    task_id: str
    user_id: str
    status: str
    additional_data: Optional[dict]

# Corresponding models that would go into additional_data depending on event type.
class TaskCreated(BaseModel):
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


class TaskAssigned(BaseModel):
    task_id: str
    assigned_to_id: str


class TaskCancelled(BaseModel):
    task_id: str


class TaskCommentAdded(BaseModel):
    task_id: str
    user_id: str
    comment: str


class TaskCompleted(BaseModel):
    task_id: str
    completed_by_id: str
    attachments: List[str] = None
    marked_completed: bool = None
    verified: bool = None
    verification_method: str = None


class TaskExpired(BaseModel):
    task_id: str


class TaskRatingUpdate(BaseModel):
    task_id: str
    user_id: str


class TaskRewarded(BaseModel):
    task_id: str
    user_id: str


class TaskUpdated(BaseModel):
    task_id: str
    updated_fields: dict

class TaskVerified(BaseModel):
    task_id: str
    verified: bool
    verification_method: str # user or verifi

# Leaderboard entry schema
class LeaderboardEntry(BaseModel):
    user_id: str
    tasks_completed: int
    xrp_earned: float
    eTask_earned: float
