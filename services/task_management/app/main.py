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

# Get CORS origins from environment variable, fallback to allow all
cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
    origins = [origin.strip() for origin in cors_origins_env.split(",")]
else:
    # Fallback to specific origins instead of allowing all
    origins = [
        "https://task-coin-384722.web.app",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:19006"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
templates = Jinja2Templates(directory="app/templates")


@app.get("/", response_class=HTMLResponse)
async def hello(request: Request):
    """Return a friendly HTTP greeting."""
    response = "This service is running!"

    return templates.TemplateResponse(
        "index.html", {"request": request, "response": response}
    )

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

@app.get("/user/{user_id}/task-summary")
async def get_task_summary(user_id: str):
    """Get task summary for a user"""
    summary = db.get_task_summary(user_id)
    return summary

@app.get("/user/{user_id}/kid-task-summary")
async def get_kid_task_summary(user_id: str):
    """Get task summary for a user"""
    summary = db.get_kid_task_summary(user_id)
    return summary

@app.get("/user/{user_id}/recent-tasks")
async def get_recent_tasks(user_id: str, limit: int = 5, days: int = 7):
    """Get recent tasks for a user"""
    tasks = db.get_recent_tasks(user_id, limit, days)
    return tasks

@app.get("/user/{user_id}/rewards")
async def get_user_rewards(user_id: str):
    """Get rewards for a user"""
    rewards = db.get_user_rewards(user_id)
    return rewards

@app.get("/leaderboard/global")
async def get_global_leaderboard():
    """Get the global leaderboard"""
    leaderboard = db.get_global_leaderboard()
    return leaderboard

@app.get("/parent/{parent_id}/children-rewards")
async def get_children_rewards(parent_id: str):
    """Get rewards for a parent's children"""
    rewards = db.get_children_rewards(parent_id)
    return rewards

# Admin/Metrics Endpoints
@app.get("/admin/metrics/users")
async def get_user_metrics():
    """Get user metrics for admin dashboard"""
    metrics = db.get_user_metrics()
    return metrics

@app.get("/admin/metrics/tasks")
async def get_task_metrics():
    """Get task metrics for admin dashboard"""
    metrics = db.get_task_metrics()
    return metrics

@app.get("/admin/metrics/events")
async def get_event_metrics():
    """Get event metrics for admin dashboard"""
    metrics = db.get_event_metrics()
    return metrics

@app.get("/admin/metrics/performance")
async def get_performance_metrics():
    """Get performance metrics for admin dashboard"""
    metrics = db.get_performance_metrics()
    return metrics

@app.post("/admin/clear-test-data")
async def clear_test_data():
    """Clear test data (test environment only)"""
    result = db.clear_test_data()
    return result
# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
