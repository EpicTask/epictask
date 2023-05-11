"""
Task Management Service
"""
import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from firestore_db import write_response_to_firestore
from schema import (RecommendationGeneratedEvent, TaskAssignedEvent,
                    TaskCancelledEvent, TaskCommentAddedEvent,
                    TaskCompletedEvent, TaskCreatedEvent, TaskEvent,
                    TaskExpiredEvent, TaskRatingUpdatedEvent,
                    TaskRewardedEvent, TaskUpdatedEvent, UserRegisteredEvent,
                    UserUpdatedEvent, UserVerifiedEvent)

# pylint: disable=C0103
app = FastAPI()
templates = Jinja2Templates(directory="templates")


@app.get('/', response_class=HTMLResponse)
async def hello(request: Request):
    """Return a friendly HTTP greeting."""
    message = "It's running!"

    """Get Cloud Run environment variables."""
    service = os.environ.get('K_SERVICE', 'Unknown service')
    revision = os.environ.get('K_REVISION', 'Unknown revision')

    return templates.TemplateResponse("index.html", {"request": request, "message": message, "Service": service, "Revision": revision})


@app.post("/create_task_event")
async def create_task_event(task_event: TaskEvent):
    try:
        event_type = task_event.event_type

        # Create the appropriate event model based on the event_type
        if event_type == "TaskCreated":
            event_data = TaskCreatedEvent(**task_event.additional_data)
        elif event_type == "TaskAssigned":
            event_data = TaskAssignedEvent(**task_event.additional_data)
        elif event_type == "TaskUpdated":
            event_data = TaskUpdatedEvent(**task_event.additional_data)
        elif event_type == "TaskCompleted":
            event_data = TaskCompletedEvent(**task_event.additional_data)
        elif event_type == "TaskCancelled":
            event_data = TaskCancelledEvent(**task_event.additional_data)
        elif event_type == "TaskExpired":
            event_data = TaskExpiredEvent(**task_event.additional_data)
        elif event_type == "TaskRewarded":
            event_data = TaskRewardedEvent(**task_event.additional_data)
        elif event_type == "TaskRatingUpdated":
            event_data = TaskRatingUpdatedEvent(**task_event.additional_data)
        elif event_type == "TaskCommentAdded":
            event_data = TaskCommentAddedEvent(**task_event.additional_data)
        elif event_type == "UserRegistered":
            event_data = UserRegisteredEvent(**task_event.additional_data)
        elif event_type == "UserUpdated":
            event_data = UserUpdatedEvent(**task_event.additional_data)
        elif event_type == "UserVerified":
            event_data = UserVerifiedEvent(**task_event.additional_data)
        elif event_type == "RecommendationGenerated":
            event_data = RecommendationGeneratedEvent(
                **task_event.additional_data)
        else:
            return {"error": f"Invalid event_type: {event_type}"}

        # Set the additional_data field to the created event model
        task_event.additional_data = event_data.dict()
        
        # Call the write_response_to_firestore function
        doc_id = write_response_to_firestore(task_event)

        return {"doc_id": doc_id, "write": "success"}

    except Exception as e:
        return {"error": str(e)}



# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
