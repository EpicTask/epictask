"""API routes for story management."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status

from src.config.security import get_current_user, get_user_id
from src.domain.models import Story, StoryNode
from src.domain.validators import (
    validate_age,
    validate_story_exists,
    validate_story_published,
    validate_node_exists,
    validate_age_for_node
)
from src.services.firestore import firestore_service

router = APIRouter(prefix="/stories", tags=["stories"])


@router.get("", response_model=List[Story])
async def get_stories(
    age: Optional[int] = Query(None, ge=5, le=18, description="Filter stories by age"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all published stories, optionally filtered by age.
    
    - **age**: Optional age filter (5-18)
    
    Returns list of stories appropriate for the user.
    """
    if age is not None:
        validate_age(age)
    
    stories = await firestore_service.get_all_stories(age=age, published_only=True)
    return stories


@router.get("/{story_id}", response_model=Story)
async def get_story(
    story_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific story by ID.
    
    - **story_id**: Story identifier
    """
    story = await firestore_service.get_story(story_id)
    validate_story_exists(story, story_id)
    validate_story_published(story)
    
    return story


@router.get("/{story_id}/nodes/{node_id}", response_model=StoryNode)
async def get_node(
    story_id: str,
    node_id: str,
    age: int = Query(..., ge=5, le=18, description="User's age for age-appropriate filtering"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific story node with age-appropriate filtering.
    
    - **story_id**: Story identifier
    - **node_id**: Node identifier
    - **age**: User's age (required, 5-18)
    
    Returns node if it exists and is age-appropriate.
    Options may be filtered based on age.
    """
    validate_age(age)
    
    # Verify story exists and is published
    story = await firestore_service.get_story(story_id)
    validate_story_exists(story, story_id)
    validate_story_published(story)
    
    # Get node
    node = await firestore_service.get_node(story_id, node_id)
    validate_node_exists(node, node_id)
    
    # Check if age is appropriate for this node
    age_range = node.get("age_range", [5, 18])
    if not validate_age_for_node(age, age_range):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This content is not appropriate for age {age}"
        )
    
    # Filter options based on age (if options have age requirements)
    # For now, return all options; future enhancement could filter per-option
    
    return node


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_story(
    story: Story,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new story (admin/parent only in future).
    
    - **story**: Story data
    
    Returns the created story ID.
    """
    # TODO: Add role-based access control (admin/parent only)
    story_id = await firestore_service.create_story(story)
    return {"story_id": story_id, "message": "Story created successfully"}


@router.post("/{story_id}/nodes", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_node(
    story_id: str,
    node: StoryNode,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new node for a story (admin/parent only in future).
    
    - **story_id**: Story identifier
    - **node**: Node data
    
    Returns the created node ID.
    """
    # TODO: Add role-based access control (admin/parent only)
    
    # Verify story exists
    story = await firestore_service.get_story(story_id)
    validate_story_exists(story, story_id)
    
    node_id = await firestore_service.create_node(story_id, node)
    return {"node_id": node_id, "message": "Node created successfully"}


@router.get("/{story_id}/nodes", response_model=List[StoryNode])
async def get_story_nodes(
    story_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all nodes for a story (for debugging/admin).
    
    - **story_id**: Story identifier
    """
    story = await firestore_service.get_story(story_id)
    validate_story_exists(story, story_id)
    
    nodes = await firestore_service.get_story_nodes(story_id)
    return nodes
