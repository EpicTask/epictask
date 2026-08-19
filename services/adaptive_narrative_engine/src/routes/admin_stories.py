"""Admin API routes for LLM-powered story generation."""
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, Field

from src.config.security import get_current_user, get_user_id
from src.services.story_generator_service import story_generator


router = APIRouter(prefix="/admin/stories", tags=["admin-stories"])


class GenerateStoryRequest(BaseModel):
    """Request to generate a new story."""
    topic: str = Field(..., description="Story topic from available templates")
    provider: Literal["openai", "gemini", "grok"] = Field(default="openai", description="LLM provider to use")
    custom_title: Optional[str] = Field(None, description="Optional custom title override")
    custom_description: Optional[str] = Field(None, description="Optional custom description")


class PublishStoryRequest(BaseModel):
    """Request to publish a draft story."""
    story_id: str = Field(..., description="Draft story ID to publish")


class RejectStoryRequest(BaseModel):
    """Request to reject a draft story."""
    story_id: str = Field(..., description="Draft story ID to reject")
    reason: str = Field(..., description="Reason for rejection")


def verify_admin(current_user: dict) -> str:
    """
    Verify user has admin privileges.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User ID
        
    Raises:
        HTTPException: If user is not admin
    """
    user_id = get_user_id(current_user)
    
    # TODO: Implement proper admin role checking
    # For now, check if user is in admin list or has admin claim
    is_admin = current_user.get("admin", False) or current_user.get("role") == "admin"
    
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user_id


@router.get("/topics")
async def get_available_topics(
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of available story topics.
    
    Returns list of topics with templates that can be used for generation.
    
    **Admin Access Required**
    """
    verify_admin(current_user)
    
    topics = story_generator.get_available_topics()
    return {
        "topics": topics,
        "count": len(topics)
    }


@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def generate_story(
    request: GenerateStoryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a new story using LLM and templates.
    
    This endpoint initiates story generation which may take several minutes.
    The story will be saved as a draft that can be reviewed before publishing.
    
    **Process:**
    1. Generates all story nodes using specified LLM provider
    2. Creates age-appropriate text variants
    3. Saves as draft for review
    4. Returns story ID for preview
    
    **Admin Access Required**
    """
    user_id = verify_admin(current_user)
    
    try:
        # Prepare custom parameters if provided
        custom_params = {}
        if request.custom_title:
            custom_params["title"] = request.custom_title
        if request.custom_description:
            custom_params["description"] = request.custom_description
        
        # Generate story
        story = await story_generator.generate_story(
            topic=request.topic,
            provider=request.provider,
            custom_params=custom_params if custom_params else None
        )
        
        # Save as draft
        story_id = await story_generator.save_draft_story(story)
        
        return {
            "story_id": story_id,
            "status": "draft",
            "message": "Story generated successfully. Review before publishing.",
            "topic": request.topic,
            "provider": request.provider,
            "total_nodes": story["total_nodes"]
        }
        
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid topic: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Story generation failed: {str(e)}"
        )


@router.get("/drafts")
async def list_draft_stories(
    status_filter: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    List draft stories.
    
    **Query Parameters:**
    - status_filter: Optional filter by status (draft, published, rejected)
    - limit: Maximum number of results (default 50)
    
    Returns list of draft stories ordered by creation date (newest first).
    
    **Admin Access Required**
    """
    verify_admin(current_user)
    
    stories = await story_generator.list_draft_stories(
        status=status_filter,
        limit=limit
    )
    
    return {
        "stories": stories,
        "count": len(stories)
    }


@router.get("/drafts/{story_id}")
async def get_draft_story(
    story_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a draft story by ID with full node details.
    
    Use this endpoint to review a generated story before publishing.
    
    **Admin Access Required**
    """
    verify_admin(current_user)
    
    story = await story_generator.get_draft_story(story_id)
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Draft story not found: {story_id}"
        )
    
    return story


@router.post("/publish")
async def publish_story(
    request: PublishStoryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Publish a draft story to production.
    
    This moves the story from draft to production, making it available
    to users in the narrative learning system.
    
    **Requirements:**
    - Story must be in draft status
    - All nodes must be properly linked
    - Admin approval required
    
    **Admin Access Required**
    """
    user_id = verify_admin(current_user)
    
    try:
        story = await story_generator.publish_story(
            story_id=request.story_id,
            approved_by=user_id
        )
        
        return {
            "story_id": request.story_id,
            "status": "published",
            "message": "Story published successfully",
            "title": story["title"],
            "topic": story["topic"],
            "total_nodes": story["total_nodes"]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish story: {str(e)}"
        )


@router.post("/reject")
async def reject_story(
    request: RejectStoryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Reject a draft story.
    
    Marks the story as rejected with a reason. Rejected stories
    remain in the draft collection but are not eligible for publishing.
    
    **Admin Access Required**
    """
    user_id = verify_admin(current_user)
    
    try:
        await story_generator.reject_story(
            story_id=request.story_id,
            rejected_by=user_id,
            reason=request.reason
        )
        
        return {
            "story_id": request.story_id,
            "status": "rejected",
            "message": "Story rejected",
            "reason": request.reason
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject story: {str(e)}"
        )


@router.delete("/drafts/{story_id}")
async def delete_draft_story(
    story_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a draft story.
    
    Permanently removes a draft story from the system.
    Published stories cannot be deleted through this endpoint.
    
    **Admin Access Required**
    """
    verify_admin(current_user)
    
    try:
        # Get story to check status
        story = await story_generator.get_draft_story(story_id)
        
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Draft story not found: {story_id}"
            )
        
        if story.get("status") == "published":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete published stories"
            )
        
        # Delete from Firestore
        from src.config.firebase_config import db
        db.collection("draft_stories").document(story_id).delete()
        
        return {
            "story_id": story_id,
            "message": "Draft story deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete story: {str(e)}"
        )
