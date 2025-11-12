"""API routes for story progress tracking."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from src.config.security import get_current_user, get_user_id
from src.domain.models import AdvanceRequest, AdvanceResponse, StoryProgress
from src.domain.validators import (
    validate_age,
    validate_story_exists,
    validate_story_published,
    validate_node_exists,
    validate_choice_index,
    validate_user_ownership
)
from src.services.firestore import firestore_service
from src.services.recommender_client import recommender_client
from src.adapters.pubsub_publisher import pubsub_publisher
from src.domain.models import RecommendRequest, UserProfile

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/advance", response_model=AdvanceResponse)
async def advance_progress(
    request: AdvanceRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Advance user's progress in a story by making a choice.
    
    - **request**: Progress advancement data including user_id, story_id, node_id, choice, age
    
    Returns the next node ID and XP awarded.
    This endpoint handles the core progression logic.
    """
    user_id = get_user_id(current_user)
    validate_user_ownership(user_id, request.user_id)
    validate_age(request.age)
    
    # Verify story exists and is published
    story = await firestore_service.get_story(request.story_id)
    validate_story_exists(story, request.story_id)
    validate_story_published(story)
    
    # Get current node
    node = await firestore_service.get_node(request.story_id, request.current_node_id)
    validate_node_exists(node, request.current_node_id)
    
    # Validate choice index
    options = node.get("options", [])
    validate_choice_index(request.choice_index, len(options))
    
    # Get selected option
    selected_option = options[request.choice_index]
    next_node_id = selected_option.get("leads_to")
    xp_awarded = selected_option.get("reward_xp", 0)
    
    # Verify next node exists
    next_node = await firestore_service.get_node(request.story_id, next_node_id)
    validate_node_exists(next_node, next_node_id)
    
    # Get or create progress
    progress = await firestore_service.get_progress(request.user_id, request.story_id)
    
    if progress:
        # Update existing progress
        completed_nodes = progress.get("completed_nodes", [])
        if request.current_node_id not in completed_nodes:
            completed_nodes.append(request.current_node_id)
        
        total_xp = progress.get("total_xp", 0) + xp_awarded
        level = progress.get("level", 1)
        
        # Simple level-up logic: every 100 XP = 1 level
        new_level = (total_xp // 100) + 1
        level_up = new_level > level
        
        progress_update = StoryProgress(
            user_id=request.user_id,
            story_id=request.story_id,
            current_node=next_node_id,
            completed_nodes=completed_nodes,
            total_xp=total_xp,
            level=new_level,
            preferred_topics=progress.get("preferred_topics", [])
        )
    else:
        # Create new progress
        progress_update = StoryProgress(
            user_id=request.user_id,
            story_id=request.story_id,
            current_node=next_node_id,
            completed_nodes=[request.current_node_id],
            total_xp=xp_awarded,
            level=1,
            preferred_topics=[]
        )
        level_up = False
        new_level = 1
    
    # Save progress
    await firestore_service.create_or_update_progress(progress_update)
    
    # Publish progress event to Pub/Sub
    try:
        await pubsub_publisher.publish_progress_event(
            user_id=request.user_id,
            story_id=request.story_id,
            from_node=request.current_node_id,
            to_node=next_node_id,
            xp_awarded=xp_awarded,
            age=request.age
        )
        
        # Check if story is completed (terminal node reached)
        if next_node.get("is_terminal", False):
            await pubsub_publisher.publish_story_completed_event(
                user_id=request.user_id,
                story_id=request.story_id,
                final_node=next_node_id,
                total_xp=progress_update.total_xp
            )
    except Exception as e:
        # Log but don't fail the request
        print(f"Failed to publish progress event: {str(e)}")
    
    # Check for payout hint on next node
    payout_candidate = next_node.get("payout_hint")
    
    return AdvanceResponse(
        next_node_id=next_node_id,
        xp_awarded=xp_awarded,
        payout_candidate=payout_candidate,
        level_up=level_up,
        new_level=new_level if level_up else None
    )


@router.get("/{user_id}/{story_id}", response_model=StoryProgress)
async def get_progress(
    user_id: str,
    story_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's progress for a specific story.
    
    - **user_id**: User identifier
    - **story_id**: Story identifier
    
    Returns progress data or 404 if not found.
    """
    auth_user_id = get_user_id(current_user)
    validate_user_ownership(auth_user_id, user_id)
    
    progress = await firestore_service.get_progress(user_id, story_id)
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found for this user and story"
        )
    
    progress["user_id"] = user_id
    progress["story_id"] = story_id
    return progress


@router.get("/{user_id}", response_model=List[StoryProgress])
async def get_all_progress(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all story progress for a user.
    
    - **user_id**: User identifier
    
    Returns list of progress entries.
    """
    auth_user_id = get_user_id(current_user)
    validate_user_ownership(auth_user_id, user_id)
    
    progress_list = await firestore_service.get_all_user_progress(user_id)
    return progress_list
