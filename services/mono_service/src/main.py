"""
EpicTask Monorepo Service
Unified service combining all services for EpicTask.
"""
import os
from dotenv import load_dotenv
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates

load_dotenv()

# Setup Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Initialize FastAPI app
app = FastAPI(
    title="EpicTask Unified Service",
    description="Combined task management and user management",
    version="1.0.0"
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "").split(",")
if not cors_origins or cors_origins == ['']:
    cors_origins = [
        "http://localhost:8080",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") == "true" else "An unexpected error occurred"
        }
    )

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "epictask-unified",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "modules": ["tasks", "users"]
    }

# Root endpoint
@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "service": "EpicTask Unified Service",
            "version": "1.0.0"
        }
    )

# Import and include routers
from src.routes.tasks import task_routes
from src.routes.users import user_routes
from src.routes.notifications import notification_routes
# from src.routes.contracts import contract_routes
from src.routes.xrpl import xrpl_routes
from src.routes.internal import internal_routes


# Task routes
app.include_router(task_routes.router, prefix="/api/tasks", tags=["tasks"])

# User routes
app.include_router(user_routes.router, prefix="/api/users", tags=["users"])

# Notification routes
app.include_router(notification_routes.router, prefix="/api/notifications", tags=["notifications"])

# Contract routes
# app.include_router(contract_routes.router, prefix="/api/contracts", tags=["contracts"])

# XRPL routes
app.include_router(xrpl_routes.router, prefix="/api/xrpl", tags=["xrpl"])

# Service-to-service only; guarded by a shared internal token, never a user ID token.
app.include_router(internal_routes.router, prefix="/api", tags=["internal"])

if __name__ == "__main__":
    import uvicorn
    server_port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=server_port)
