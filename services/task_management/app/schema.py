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
    task_title: str = None
    task_description: str
    task_id: str
    expiration_date: int
    reward_amount: float
    reward_currency: str
    payment_method: str  # Pay directly or Escrow, Tokens
    user_id: str
    project_id: str = None
    project_name: str = None
    requires_attachments: bool = False
    terms_blob: str = None
    terms_id: str = None
    rating: int = None
    assigned_to_ids: List[str] = None
    rewarded: bool = None


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


"expiration_date": 1686257027
"payment_method": "Pay directly"
"reward_amount": 663.5
"reward_currency": "XRP"
"task_description": "Test Task"
"task_id": ""
"user_id": "7ywLtEPiu4VGFyxkD6EobNQBhh72"