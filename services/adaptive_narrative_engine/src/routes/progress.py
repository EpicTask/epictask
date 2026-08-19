"""API routes for story progress tracking."""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

logger = logging.getLogger(__name__)

from src.config.security import get_current_user, get_user_id
from src.domain.models import (
    AdvanceRequest,
    AdvanceResponse,
    StoryProgress,
    StartStoryRequest,
    StartStoryResponse,
    MoneyMomentCompleteRequest,
)
from src.domain.validators import (
    validate_age,
    validate_story_exists,
    validate_story_published,
    validate_node_exists,
    validate_choice_index,
    validate_user_ownership
)
from src.services.firestore import firestore_service, resolve_user_age
from src.services.recommender_client import recommender_client
from src.adapters.pubsub_publisher import pubsub_publisher
from src.domain.models import RecommendRequest, UserProfile, KidProgressSummary

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/start", response_model=dict)
async def start_story(
    request: StartStoryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Start a new story for a user.
    """
    user_id = get_user_id(current_user)
    validate_user_ownership(user_id, request.user_id)
    
    # Verify story exists and is published
    story = await firestore_service.get_story(request.story_id)
    validate_story_exists(story, request.story_id)
    validate_story_published(story)
    
    # Get all nodes to find the first one (order=0)
    nodes = await firestore_service.get_story_nodes(request.story_id)
    if not nodes:
        raise HTTPException(status_code=404, detail="Story has no nodes")
        
    first_node = next((n for n in nodes if n.get("order", 0) == 0), nodes[0])
    
    # Create initial progress
    progress = StoryProgress(
        user_id=request.user_id,
        story_id=request.story_id,
        current_node=first_node["node_id"],
        completed_nodes=[],
        total_xp=0,
        level=1,
        preferred_topics=[],
        status="in_progress"
    )
    
    await firestore_service.create_or_update_progress(progress)
    
    return {
        "node": first_node,
        "progress": progress.model_dump()
    }


@router.get("/summary/{user_id}", response_model=KidProgressSummary)
async def get_progress_summary(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a summary of user's narrative progress and payouts.
    """
    auth_user_id = get_user_id(current_user)
    validate_user_ownership(auth_user_id, user_id)
    
    summary = await firestore_service.get_progress_summary(user_id)
    return summary


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
    user_age = resolve_user_age(user_id)
    validate_age(user_age)
    
    # Verify story exists and is published
    story = await firestore_service.get_story(request.story_id)
    validate_story_exists(story, request.story_id)
    validate_story_published(story)
    
    # Get current node
    node = await firestore_service.get_node(request.story_id, request.current_node_id)
    validate_node_exists(node, request.current_node_id)
    
    # Get selected option
    options = node.get("options", [])
    selected_option = None
    
    if request.selected_option_id:
        selected_option = next((o for o in options if o.get("option_id") == request.selected_option_id), None)
        if not selected_option:
            raise HTTPException(status_code=400, detail="Invalid option ID")
    else:
        validate_choice_index(request.choice_index, len(options))
        selected_option = options[request.choice_index]
        
    next_node_id = selected_option.get("leads_to") or selected_option.get("next_node_id")
    xp_awarded = selected_option.get("reward_xp", 0)
    
    # Verify next node exists
    next_node = await firestore_service.get_node(request.story_id, next_node_id)
    validate_node_exists(next_node, next_node_id)
    
    # Get or create progress
    progress = await firestore_service.get_progress(request.user_id, request.story_id)
    
    is_completed = next_node.get("is_terminal", False)
    new_status = "completed" if is_completed else "in_progress"
    
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
            preferred_topics=progress.get("preferred_topics", []),
            status=new_status,
            started_at=progress.get("started_at"),
            completed_money_moment_ids=progress.get("completed_money_moment_ids", []),
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
            preferred_topics=[],
            status=new_status
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
            age=user_age
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
        logger.error(f"Failed to publish progress event: {str(e)}")
    
    # Check for payout hint on next node
    payout_candidate = next_node.get("payout_hint")
    
    return AdvanceResponse(
        next_node=next_node,
        xp_earned=xp_awarded,
        payout_earned=payout_candidate.get("amount_min") if payout_candidate else None,
        story_completed=is_completed,
        progress=progress_update,
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


@router.post("/money-moment/complete", response_model=dict)
async def complete_money_moment(
    request: MoneyMomentCompleteRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Record that a Money Moment has been completed for the current user.

    Idempotent: repeated calls with the same moment_id are no-ops.
    """
    auth_user_id = get_user_id(current_user)
    validate_user_ownership(auth_user_id, request.user_id)

    progress = await firestore_service.get_progress(request.user_id, request.story_id)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found for this user and story"
        )

    await firestore_service.add_completed_money_moment(
        user_id=request.user_id,
        story_id=request.story_id,
        moment_id=request.moment_id,
    )

    return {"status": "ok", "moment_id": request.moment_id}
