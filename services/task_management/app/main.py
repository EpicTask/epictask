"""
Task Management Service
"""

import os

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
from .config.security import get_current_user
from .storage import firestore_db as db
from .schema import schema

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
    allow_methods=["GET", "POST"],
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

@app.post("/TaskCreated", dependencies=[Depends(get_current_user)])
async def task_created_func(request: schema.TaskCreated):
    """Create and store a new task"""

    response = db.create_task(request)
    return response


@app.post("/TaskAssigned", dependencies=[Depends(get_current_user)])
def task_assigned_func(request: schema.TaskAssigned):
    """Assign a task to a user"""

    event_type = "TaskAssigned"
    response = db.assign_task(event_type, request)
    return {"response": response}


@app.post("/TaskCancelled", dependencies=[Depends(get_current_user)])
async def task_cancelled_func(request: schema.TaskCancelled):
    """Cancel a task"""

    event_type = "TaskCancelled"
    response = db.delete_task(event_type, request)
    return {"response": response}


@app.post("/TaskCommentAdded", dependencies=[Depends(get_current_user)])
async def task_comment_func(request: schema.TaskCommentAdded):
    """Add a comment to a task"""

    response = db.add_comment(request)
    return {"response": response}


@app.post("/TaskCompleted", dependencies=[Depends(get_current_user)])
async def task_completed_func(request: schema.TaskCompleted):
    """Mark a task as completed"""

    response = db.completed_task(request)
    return {"response": response}


@app.post("/TaskExpired", dependencies=[Depends(get_current_user)])
async def task_expired_func(request: schema.TaskExpired):
    """Mark a task as expired"""

    response = db.task_expired(request)
    return {"response": response}


@app.post("/TaskRatingUpdate", dependencies=[Depends(get_current_user)])
async def task_rating_func(request: schema.TaskRatingUpdate):
    """Update the rating of a task"""

    response = db.task_rating_update(request)
    return {"response": response}


@app.post("/TaskRewarded", dependencies=[Depends(get_current_user)])
async def task_rewared_func(request: schema.TaskRewarded):
    """Reward a user for completing a task"""

    event_type = "TaskRewarded"
    response = db.update_task(event_type, request)
    
    # Automatically update leaderboard for all assigned users
    try:
        leaderboard_response = db.update_enhanced_leaderboard(request)
        print(f"Leaderboard updated: {leaderboard_response}")
    except Exception as e:
        print(f"Warning: Failed to update leaderboard: {str(e)}")
    
    return {"response": response}


@app.post("/TaskUpdated", dependencies=[Depends(get_current_user)])
async def task_updated_func(request: schema.TaskUpdated):
    """Update the fields of a task"""

    event_type = "TaskUpdated"
    response = db.update_task_fields(event_type, request)
    return {"response": response}


@app.post("/TaskVerified", dependencies=[Depends(get_current_user)])
async def task_verified_func(request: schema.TaskVerified):
    """Mark a task as verified"""

    event_type = "TaskVerified"
    response = db.update_task(event_type, request)
    
    # Automatically update leaderboard for all assigned users
    try:
        leaderboard_response = db.update_enhanced_leaderboard(request)
        print(f"Leaderboard updated: {leaderboard_response}")
    except Exception as e:
        print(f"Warning: Failed to update leaderboard: {str(e)}")
    
    return {"response": response}


@app.get("/tasks", dependencies=[Depends(get_current_user)])
async def get_all_tasks(user_id: str):
    """Get all tasks"""

    tasks = db.get_tasks(user_id)

    return {"responses": tasks}

@app.get("/get_task/{task_id}", dependencies=[Depends(get_current_user)])
async def get_task(task_id: str):
    """Get task by ID"""

    response = db.get_task(task_id)

    return {"response": response}

@app.get("/leaderboard/family/{parent_id}", dependencies=[Depends(get_current_user)])
async def get_family_leaderboard(parent_id: str):
    """Get family leaderboard for parent view"""
    leaderboard = db.get_family_leaderboard(parent_id)
    return leaderboard

@app.get("/leaderboard/kid/{kid_id}", dependencies=[Depends(get_current_user)])
async def get_kid_leaderboard_view(kid_id: str):
    """Get kid-specific leaderboard view"""
    view = db.get_kid_leaderboard_view(kid_id)
    return view

@app.get("/leaderboard/enhanced-global", dependencies=[Depends(get_current_user)])
async def get_enhanced_global_leaderboard(limit: int = 100):
    """Get enhanced global leaderboard with token-based scoring only"""
    try:
        leaderboard_ref = db.db.collection(db.collections.LEADERBOARD)
        query = leaderboard_ref.order_by(
            "token_score", direction=db.firestore.Query.DESCENDING
        ).limit(limit)
        
        leaderboard_data = []
        for doc in query.get():
            data = doc.to_dict()
            leaderboard_data.append({
                "user_id": doc.id,
                "display_name": data.get("display_name", ""),
                "tasks_completed": data.get("tasks_completed", 0),
                "xrp_earned": data.get("xrp_earned", 0.0),
                "rlusd_earned": data.get("rlusd_earned", 0.0),
                "etask_earned": data.get("eTask_earned", 0.0),
                "token_score": data.get("token_score", 0.0),
                "level": data.get("level", 1),
                "last_updated": data.get("last_updated")
            })
        
        return {"leaderboard": leaderboard_data, "total_entries": len(leaderboard_data)}
        
    except Exception as e:
        return {"error": f"Failed to get enhanced global leaderboard: {str(e)}"}
# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
