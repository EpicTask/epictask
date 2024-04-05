"""
Task Management Service
"""

import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
import storage.firestore_db as db
from schema import schema

app = FastAPI()

baseUrl = os.getenv("_BASEURL")
defaultUrl = os.getenv("_DEFAULT_URL")
origins = [baseUrl, defaultUrl]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
templates = Jinja2Templates(directory="app/templates")


@app.get("/", response_class=HTMLResponse)
async def hello(request: Request):
    """Return a friendly HTTP greeting."""
    response = "This service is running!"

    return templates.TemplateResponse(
        "index.html", {"request": request, "response": response}
    )


# Create Task Event
@app.post("/TaskEvent")
async def task_func(request: schema.TaskEvent):
    """Store the event"""

    response = db.write_event_to_firestore(request)
    return {"response": response}


@app.post("/TaskCreated")
async def task_created_func(request: schema.TaskCreated):
    """Create and store a new task"""

    response = db.create_task(request)
    return response


@app.post("/TaskAssigned")
def task_assigned_func(request: schema.TaskAssigned):
    """Assign a task to a user"""

    event_type = "TaskAssigned"
    response = db.assign_task(event_type, request)
    return {"response": response}


@app.post("/TaskCancelled")
async def task_cancelled_func(request: schema.TaskCancelled):
    """Cancel a task"""

    event_type = "TaskCancelled"
    response = db.delete_task(event_type, request)
    return {"response": response}


@app.post("/TaskCommentAdded")
async def task_comment_func(request: schema.TaskCommentAdded):
    """Add a comment to a task"""

    event_type = "TaskCommentAdded"
    response = db.update_task(event_type, request)
    return {"response": response}


@app.post("/TaskCompleted")
async def task_completed_func(request: schema.TaskCompleted):
    """Mark a task as completed"""

    event_type = "TaskCompleted"
    response = db.completed_task(event_type, request)
    return {"response": response}


@app.post("/TaskExpired")
async def task_expired_func(request: schema.TaskExpired):
    """Mark a task as expired"""

    event_type = "TaskExpired"
    response = db.update_task(event_type, request)
    return {"response": response}


@app.post("/TaskRatingUpdate")
async def task_rating_func(request: schema.TaskRatingUpdate):
    """Update the rating of a task"""

    event_type = "TaskRatingUpdate"
    response = db.update_task(event_type, request)
    return {"response": response}


@app.post("/TaskRewarded")
async def task_rewared_func(request: schema.TaskRewarded):
    """Reward a user for completing a task"""

    event_type = "TaskRewarded"
    response = db.update_task(event_type, request)
    return {"response": response}


@app.post("/TaskUpdated")
async def task_updated_func(request: schema.TaskUpdated):
    """Update the fields of a task"""

    event_type = "TaskUpdated"
    response = db.update_task_fields(event_type, request)
    return {"response": response}


@app.post("/TaskVerified")
async def task_verified_func(request: schema.TaskVerified):
    """Mark a task as verified"""

    event_type = "TaskVerified"
    response = db.update_task(event_type, request)
    return {"response": response}


@app.post("/UpdateLeaderboard")
async def task_leaderboard_func(request: schema.TaskCreated):
    """Update the leaderboard"""

    response = db.update_leaderboard(request)
    return {"response": response}


@app.get("/tasks")
async def get_all_tasks(user_id: str):
    """Get all tasks"""

    tasks = db.get_tasks(user_id)

    return {"responses": tasks}

@app.get("/get_task/{task_id}")
async def get_task(task_id: str):
    """Get task by ID"""

    response = db.get_task(task_id)

    return {"response": response}
# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
