from dataclasses import dataclass
from typing import Union, Dict, List
from model import TaskType

@dataclass
class Task:
    task_id: str
    task_data: Union[str, Dict, List]

@dataclass
class VerificationRequest:
    task_id: str
    task_data: Union[str, Dict, List]
    task_type: TaskType

@dataclass
class VerificationResult:
    task_id: str
    model_id: str
    result: Union[str, Dict, List]
