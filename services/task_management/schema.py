from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class TaskEvent(BaseModel):
    event_id: str
    event_type: str
    timestamp: datetime
    task_id: str
    user_id: str
    status: str
    additional_data: Optional[dict]

# Corresponding models that would go into additional_data depending on event type.

class TaskCreatedEvent(BaseModel):
    task_title: str
    task_description: str
    task_id: str
    project_id: str
    project_name: str
    terms_blob: str
    terms_id: str
    reward_amount: float
    reward_currency: str

class TaskAssignedEvent(BaseModel):
    task_id: str
    assigned_to: str
    assigned_to_wallet_address: str
    task_creator_id: str
    task_creator_wallet_address: str
    reward_amount: float
    reward_currency: str
    wallet_type: str

class TaskUpdatedEvent(BaseModel):
    task_id: str
    updated_fields: dict

class TaskCompletedEvent(BaseModel):
    task_id: str
    completed_by: str

class TaskCancelledEvent(BaseModel):
    task_id: str
    cancelled_by: str

class TaskExpiredEvent(BaseModel):
    task_id: str
    expiry_time: datetime

class TaskRewardedEvent(BaseModel):
    task_id: str
    user_id: str
    reward_amount: float
    reward_currency: str

class TaskRatingUpdatedEvent(BaseModel):
    task_id: str
    user_id: str
    new_rating: int

class TaskCommentAddedEvent(BaseModel):
    task_id: str
    user_id: str
    comment: str

class UserRegisteredEvent(BaseModel):
    user_id: str
    registration_date: datetime

class UserUpdatedEvent(BaseModel):
    user_id: str
    updated_fields: dict

class UserVerifiedEvent(BaseModel):
    user_id: str
    verification_method: str

class RecommendationGeneratedEvent(BaseModel):
    user_id: str
    recommendation: str
