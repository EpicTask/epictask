"""
Task Management Service
"""
import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
from firestore_db import create_task, update_task, delete_task, assign_task, completed_task, get_tasks
from schema import (TaskAssigned, TaskCreated, TaskCancelled, TaskCompleted,
                    TaskCommentAdded, TaskExpired, TaskRatingUpdate, TaskRewarded, TaskUpdated)
from dotenv import load_dotenv
app = FastAPI()

load_dotenv()

baseUrl = os.getenv("BASEURL")
defaultUrl = os.getenv("DEFAULT_URL")
origins = [
    baseUrl,
    defaultUrl,
]
print(baseUrl, defaultUrl)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
templates = Jinja2Templates(directory="templates")


@app.get('/', response_class=HTMLResponse)
async def hello(request: Request):
    """Return a friendly HTTP greeting."""
    message = "It's running!"
    print(baseUrl, defaultUrl)
    """Get Cloud Run environment variables."""
    service = os.environ.get('K_SERVICE', 'Unknown service')
    revision = os.environ.get('K_REVISION', 'Unknown revision')

    return templates.TemplateResponse("index.html", {"request": request, "message": message, "Service": service, "Revision": revision})


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
        response = await delete_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskCommentAdded')
async def task_func(request: TaskCommentAdded):
    try:
        event_type = 'TaskCommentAdded'
        response = await update_task(event_type, request)
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
        response = await update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskRatingUpdate')
async def task_func(request: TaskRatingUpdate):
    try:
        event_type = 'TaskRatingUpdate'
        response = await update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskRewarded')
async def task_func(request: TaskRewarded):
    try:
        event_type = 'TaskRewarded'
        response = await update_task(event_type, request)
        return {"message": response}
    except Exception as e:
        return {"error": str(e)}


@app.post('/TaskUpdated')
async def task_func(request: TaskUpdated):
    try:
        event_type = 'TaskUpdated'
        response = await update_task(event_type, request)
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
