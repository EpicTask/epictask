from dataclasses import dataclass
from typing import Optional, List
from enum import Enum

class TaskType(Enum):
    DATA_ENTRY = "data_entry"
    DOCUMENTATION_REVIEW = "documentation_review"
    IMAGE_RECOGNITION = "image_recognition"
    IMAGE_VIDEO_PROCESSING = "image_video_processing"
    FINANCIAL_TRANSACTIONS = "financial_transactions"

    # Other examples
    # QUALITY_ASSURANCE = "quality_assurance"
    # CUSTOMER_SERVICE = "customer_service"
    # CONTENT_MODERATION = "content_moderation"
    # LANGUAGE_TRANSLATION = "language_translation"

class VerificationType(Enum):
    IMAGE_RECOGNITION = "image_recognition"
    TEXT_ANALYSIS = "text_analysis"
    FRAUD_DETECTION = "fraud_detection"

@dataclass
class Model:
    model_id: str
    name: str
    version: str
    verification_type: VerificationType
    performance: float
    accuracy: float
    availability: float
    input_format: str
    output_format: str
    dependencies: List[str]
