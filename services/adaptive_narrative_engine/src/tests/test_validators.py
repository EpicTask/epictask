"""Unit tests for validators."""
import pytest
from fastapi import HTTPException

from src.domain.validators import (
    validate_age,
    validate_age_for_node,
    validate_choice_index,
    validate_payout_amount,
    validate_node_exists,
    validate_story_exists,
    validate_story_published,
    validate_user_ownership
)


class TestValidateAge:
    """Tests for validate_age function."""
    
    def test_valid_age(self):
        """Test valid age doesn't raise exception."""
        validate_age(10)  # Should not raise
    
    def test_age_too_low(self):
        """Test age below minimum."""
        with pytest.raises(HTTPException) as exc_info:
            validate_age(3)
        assert exc_info.value.status_code == 400
    
    def test_age_too_high(self):
        """Test age above maximum."""
        with pytest.raises(HTTPException) as exc_info:
            validate_age(25)
        assert exc_info.value.status_code == 400
    
    def test_boundary_ages(self):
        """Test boundary ages."""
        validate_age(5)  # Min age, should not raise
        validate_age(18)  # Max age, should not raise


class TestValidateAgeForNode:
    """Tests for validate_age_for_node function."""
    
    def test_age_within_range(self):
        """Test age within node's age range."""
        assert validate_age_for_node(8, [5, 10]) is True
    
    def test_age_below_range(self):
        """Test age below node's age range."""
        assert validate_age_for_node(4, [5, 10]) is False
    
    def test_age_above_range(self):
        """Test age above node's age range."""
        assert validate_age_for_node(12, [5, 10]) is False
    
    def test_age_at_boundaries(self):
        """Test age at range boundaries."""
        assert validate_age_for_node(5, [5, 10]) is True
        assert validate_age_for_node(10, [5, 10]) is True
    
    def test_invalid_age_range(self):
        """Test with invalid age range format."""
        assert validate_age_for_node(8, [5]) is False


class TestValidateChoiceIndex:
    """Tests for validate_choice_index function."""
    
    def test_valid_choice(self):
        """Test valid choice index."""
        validate_choice_index(0, 3)  # Should not raise
        validate_choice_index(2, 3)  # Should not raise
    
    def test_negative_index(self):
        """Test negative choice index."""
        with pytest.raises(HTTPException) as exc_info:
            validate_choice_index(-1, 3)
        assert exc_info.value.status_code == 400
    
    def test_index_too_large(self):
        """Test choice index exceeding options."""
        with pytest.raises(HTTPException) as exc_info:
            validate_choice_index(3, 3)  # Index 3 with 3 options (0-2)
        assert exc_info.value.status_code == 400


class TestValidatePayoutAmount:
    """Tests for validate_payout_amount function."""
    
    def test_valid_amount(self):
        """Test valid payout amount."""
        validate_payout_amount(5.0)  # Should not raise
    
    def test_zero_amount(self):
        """Test zero payout amount."""
        with pytest.raises(HTTPException) as exc_info:
            validate_payout_amount(0)
        assert exc_info.value.status_code == 400
    
    def test_negative_amount(self):
        """Test negative payout amount."""
        with pytest.raises(HTTPException) as exc_info:
            validate_payout_amount(-1.0)
        assert exc_info.value.status_code == 400
    
    def test_amount_exceeds_limit(self):
        """Test payout amount exceeding daily limit."""
        with pytest.raises(HTTPException) as exc_info:
            validate_payout_amount(15.0, max_daily=10.0)
        assert exc_info.value.status_code == 400


class TestValidateNodeExists:
    """Tests for validate_node_exists function."""
    
    def test_node_exists(self):
        """Test when node data exists."""
        validate_node_exists({"id": "node_1"}, "node_1")  # Should not raise
    
    def test_node_not_found(self):
        """Test when node doesn't exist."""
        with pytest.raises(HTTPException) as exc_info:
            validate_node_exists(None, "node_1")
        assert exc_info.value.status_code == 404


class TestValidateStoryExists:
    """Tests for validate_story_exists function."""
    
    def test_story_exists(self):
        """Test when story data exists."""
        validate_story_exists({"id": "story_1"}, "story_1")  # Should not raise
    
    def test_story_not_found(self):
        """Test when story doesn't exist."""
        with pytest.raises(HTTPException) as exc_info:
            validate_story_exists(None, "story_1")
        assert exc_info.value.status_code == 404


class TestValidateStoryPublished:
    """Tests for validate_story_published function."""
    
    def test_published_story(self):
        """Test when story is published."""
        validate_story_published({"published": True})  # Should not raise
    
    def test_unpublished_story(self):
        """Test when story is not published."""
        with pytest.raises(HTTPException) as exc_info:
            validate_story_published({"published": False})
        assert exc_info.value.status_code == 403
    
    def test_missing_published_field(self):
        """Test when published field is missing."""
        with pytest.raises(HTTPException) as exc_info:
            validate_story_published({})
        assert exc_info.value.status_code == 403


class TestValidateUserOwnership:
    """Tests for validate_user_ownership function."""
    
    def test_matching_user_ids(self):
        """Test when user IDs match."""
        validate_user_ownership("user_123", "user_123")  # Should not raise
    
    def test_mismatched_user_ids(self):
        """Test when user IDs don't match."""
        with pytest.raises(HTTPException) as exc_info:
            validate_user_ownership("user_123", "user_456")
        assert exc_info.value.status_code == 403
