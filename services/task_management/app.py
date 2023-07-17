"""
Task Management Service
"""
import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
from firestore_db import create_task, update_task, delete_task, assign_task, completed_task, get_tasks, write_event_to_firestore
from schema import (TaskAssigned, TaskCreated, TaskCancelled, TaskCompleted,
                    TaskCommentAdded, TaskEvent, TaskExpired, TaskRatingUpdate, TaskRewarded, TaskUpdated, TaskVerified)

app = FastAPI()

baseUrl = os.getenv("_BASEURL")
defaultUrl = os.getenv("_DEFAULT_URL")
origins = [
    baseUrl,
    defaultUrl,
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
templates = Jinja2Templates(directory="app/templates")


@app.get('/', response_class=HTMLResponse)
async def hello(request: Request):
    """Return a friendly HTTP greeting."""
    message = "This service is running!"

    return templates.TemplateResponse("index.html", {"request": request, "message": message})

# Create Task Event
@app.post('/TaskEvent')
async def task_func(request: TaskEvent):
    try:
        response = write_event_to_firestore(request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskCreated')
async def task_func(request: TaskCreated):
    try:
        response = create_task(request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskAssigned')
def task_func(request: TaskAssigned):
    try:
        event_type = 'TaskAssigned'
        response = assign_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskCancelled')
async def task_func(request: TaskCancelled):
    try:
        event_type = 'TaskCancelled'
        response = delete_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskCommentAdded')
async def task_func(request: TaskCommentAdded):
    try:
        event_type = 'TaskCommentAdded'
        response = update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskCompleted')
async def task_func(request: TaskCompleted):
    try:
        event_type = 'TaskCompleted'
        response = completed_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskExpired')
async def task_func(request: TaskExpired):
    try:
        event_type = 'TaskExpired'
        response = update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskRatingUpdate')
async def task_func(request: TaskRatingUpdate):
    try:
        event_type = 'TaskRatingUpdate'
        response = update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskRewarded')
async def task_func(request: TaskRewarded):
    try:
        event_type = 'TaskRewarded'
        response = update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskUpdated')
async def task_func(request: TaskUpdated):
    try:
        event_type = 'TaskUpdated'
        response = update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}

@app.post('/TaskVerified')
async def task_func(request: TaskVerified):
    try:
        event_type = 'TaskVerified'
        response = update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}

@app.get("/tasks")
async def get_all_tasks(user_id: str):
    try:
        tasks = get_tasks(user_id)

        return {"docs": tasks}
    except Exception as e:
        return {"error": str(e)}

# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
