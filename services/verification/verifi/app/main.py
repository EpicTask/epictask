from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import List, Dict, Union
import json
import os
from google.cloud import storage
from model_manager import ModelManager, Model, TaskType, VerificationType
from task import Task, VerificationRequest, VerificationResult

app = FastAPI()

# Initialize ModelManager with models from GCP Cloud Storage
model_manager = ModelManager()
model_manager.load_models_from_gcp()

class ModelRequirements(BaseModel):
    model_id: str
    input_format: str
    output_format: str
    dependencies: List[str]

@app.post("/verify_task")
async def verify_task(verification_request: VerificationRequest) -> VerificationResult:
    model = model_manager.select_model(verification_request.task_type)
    if not model:
        raise HTTPException(status_code=404, detail="No suitable model found for the given task type")

    if not model_manager.check_requirements(model, verification_request.task_data):
        raise HTTPException(status_code=400, detail="Task data does not meet the model's requirements")

    result = model_manager.execute_model(model, verification_request.task_data)
    return VerificationResult(task_id=verification_request.task_id, model_id=model.model_id, result=result)

@app.get("/model_requirements/{model_id}")
async def get_model_requirements(model_id: str) -> ModelRequirements:
    model = model_manager.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    return ModelRequirements(
        model_id=model.model_id,
        input_format=model.input_format,
        output_format=model.output_format,
        dependencies=model.dependencies
    )

@app.get("/result/{task_id}")
async def get_result(task_id: str) -> VerificationResult:
    result = model_manager.retrieve_result(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    return result
