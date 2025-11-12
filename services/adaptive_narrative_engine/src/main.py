"""
Adaptive Narrative Engine (ANE) - Main Application
Narrative-first learning for ages 5-18 with blockchain rewards
"""
import os
from dotenv import load_dotenv
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates

from src.domain.models import HealthResponse

load_dotenv()

# Setup Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Initialize FastAPI app
app = FastAPI(
    title="Adaptive Narrative Engine",
    description="Narrative-first learning engine for ages 5-18 with blockchain rewards",
    version="0.1.0"
)

# Get CORS origins from environment variable
cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
    origins = [origin.strip() for origin in cors_origins_env.split(",")]
else:
    # Fallback to specific origins
    origins = [
        "https://task-coin-384722.web.app",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:19006"
    ]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") else "An unexpected error occurred"
        }
    )


# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns service status and version information.
    """
    return HealthResponse(
        status="healthy",
        service="adaptive-narrative-engine",
        version="0.1.0",
        timestamp=datetime.now().astimezone().isoformat()
    )


@app.get("/")
async def root(request: Request):
    """Root endpoint - serves API tester UI."""
    # Get base URL for the API
    base_url = str(request.base_url).rstrip('/')
    
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "service": "Adaptive Narrative Engine",
            "version": "0.1.0",
            "description": "Narrative-first learning for ages 5-18 with blockchain rewards",
            "base_url": base_url
        }
    )


# Import routes
from src.routes import stories, progress, payouts, parent, admin_stories

# Include routers
app.include_router(stories.router)
app.include_router(progress.router)
app.include_router(payouts.router)
app.include_router(parent.router)
app.include_router(admin_stories.router)

if __name__ == "__main__":
    import uvicorn
    
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")
    
    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
