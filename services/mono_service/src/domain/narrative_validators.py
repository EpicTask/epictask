"""Validators for Adaptive Narrative Engine domain logic."""
from typing import Optional
from fastapi import HTTPException, status


def validate_age(age: int, min_age: int = 5, max_age: int = 18) -> None:
    """
    Validate that age is within acceptable range.
    
    Args:
        age: Age to validate
        min_age: Minimum acceptable age (default 5)
        max_age: Maximum acceptable age (default 18)
        
    Raises:
        HTTPException: If age is out of range
    """
    if age < min_age or age > max_age:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Age must be between {min_age} and {max_age}"
        )


def validate_age_for_node(age: int, age_range: list) -> bool:
    """
    Check if user's age is appropriate for a node.
    
    Args:
        age: User's age
        age_range: Node's age range [min, max]
        
    Returns:
        bool: True if age is within range, False otherwise
    """
    if len(age_range) != 2:
        return False
    return age_range[0] <= age <= age_range[1]


def validate_choice_index(choice_index: int, num_options: int) -> None:
    """
    Validate that choice index is within available options.
    
    Args:
        choice_index: The selected choice index
        num_options: Number of available options
        
    Raises:
        HTTPException: If choice_index is invalid
    """
    if choice_index < 0 or choice_index >= num_options:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid choice index. Must be between 0 and {num_options - 1}"
        )


def validate_payout_amount(amount: float, max_daily: float = 10.0) -> None:
    """
    Validate payout amount is within acceptable limits.
    
    Args:
        amount: Requested payout amount
        max_daily: Maximum daily payout limit (default 10.0)
        
    Raises:
        HTTPException: If amount exceeds limits
    """
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payout amount must be greater than 0"
        )
    if amount > max_daily:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payout amount exceeds daily limit of {max_daily}"
        )


def validate_node_exists(node_data: Optional[dict], node_id: str) -> None:
    """
    Validate that a node exists.
    
    Args:
        node_data: Node data from Firestore
        node_id: Node ID being validated
        
    Raises:
        HTTPException: If node doesn't exist
    """
    if not node_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node '{node_id}' not found"
        )


def validate_story_exists(story_data: Optional[dict], story_id: str) -> None:
    """
    Validate that a story exists.
    
    Args:
        story_data: Story data from Firestore
        story_id: Story ID being validated
        
    Raises:
        HTTPException: If story doesn't exist
    """
    if not story_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Story '{story_id}' not found"
        )


def validate_story_published(story_data: dict) -> None:
    """
    Validate that a story is published.
    
    Args:
        story_data: Story data from Firestore
        
    Raises:
        HTTPException: If story is not published
    """
    if not story_data.get("published", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Story is not published"
        )


def validate_user_ownership(user_id: str, resource_user_id: str) -> None:
    """
    Validate that a user owns a resource.
    
    Args:
        user_id: Authenticated user ID
        resource_user_id: User ID associated with the resource
        
    Raises:
        HTTPException: If user doesn't own the resource
    """
    if user_id != resource_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this resource"
        )
