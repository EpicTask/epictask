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
    task_title: str
    task_description: str
    task_id: str
    project_id: str
    project_name: str
    expiration_date: str
    requires_attachments: bool = False
    terms_blob: str
    terms_id: str
    reward_amount: float
    reward_currency: str
    payment_method: str  # Pay directly or Create Escrow, Tokens
    rating: int
    user_id: str
    assigned_to_ids: List[str]
    rewarded: bool


class TaskAssigned(BaseModel):
    task_id: str
    assigned_to_id: str
    reward_amount: float
    reward_currency: str


class TaskCancelled(BaseModel):
    task_id: str


class TaskCommentAdded(BaseModel):
    task_id: str
    user_id: str
    comment: str


class TaskCompleted(BaseModel):
    task_id: str
    completed_by_id: str
    requires_attachments: bool = False
    attachments: List[str] = None
    verification_result: bool


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
