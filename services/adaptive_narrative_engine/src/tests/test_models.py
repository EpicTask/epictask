"""Unit tests for Pydantic models."""
import pytest
from datetime import datetime
from pydantic import ValidationError

from src.domain.models import (
    Story, StoryNode, NodeOption, PayoutHint,
    StoryProgress, AdvanceRequest, AdvanceResponse,
    NarrativeAward, PayoutRequest, PayoutRequestRecord,
    UserProfile, RecommendRequest, RecommendResponse,
    HealthResponse
)


class TestStoryModel:
    """Tests for Story model."""
    
    def test_valid_story(self):
        """Test creating a valid story."""
        story = Story(
            title="Test Story",
            description="A test story",
            age_min=5,
            age_max=10,
            tags=["test", "learning"]
        )
        assert story.title == "Test Story"
        assert story.age_min == 5
        assert story.age_max == 10
        assert story.published is False  # Default
    
    def test_invalid_age_range(self):
        """Test story with invalid age range."""
        with pytest.raises(ValidationError):
            Story(
                title="Test Story",
                age_min=15,
                age_max=10  # Less than age_min
            )
    
    def test_age_out_of_bounds(self):
        """Test story with age out of bounds."""
        with pytest.raises(ValidationError):
            Story(
                title="Test Story",
                age_min=3,  # Below minimum
                age_max=10
            )


class TestNodeOption:
    """Tests for NodeOption model."""
    
    def test_valid_option(self):
        """Test creating a valid node option."""
        option = NodeOption(
            text="Choose this",
            leads_to="node_2",
            reward_xp=10
        )
        assert option.text == "Choose this"
        assert option.reward_xp == 10


class TestPayoutHint:
    """Tests for PayoutHint model."""
    
    def test_valid_payout_hint(self):
        """Test creating a valid payout hint."""
        hint = PayoutHint(
            token="eTask",
            amount_min=0.1,
            amount_max=0.5
        )
        assert hint.token == "eTask"
        assert hint.amount_min == 0.1
    
    def test_invalid_amount_range(self):
        """Test payout hint with invalid amount range."""
        with pytest.raises(ValidationError):
            PayoutHint(
                token="eTask",
                amount_min=0.5,
                amount_max=0.1  # Less than amount_min
            )


class TestStoryNode:
    """Tests for StoryNode model."""
    
    def test_valid_node(self):
        """Test creating a valid story node."""
        node = StoryNode(
            title="Scene 1",
            lesson_key="saving_basics",
            age_range=[5, 10],
            prompt="What will you do?",
            options=[
                NodeOption(text="Save", leads_to="node_2", reward_xp=10)
            ]
        )
        assert node.title == "Scene 1"
        assert node.age_range == [5, 10]
        assert len(node.options) == 1
    
    def test_invalid_age_range_length(self):
        """Test node with invalid age_range length."""
        with pytest.raises(ValidationError):
            StoryNode(
                title="Scene 1",
                lesson_key="test",
                age_range=[5, 10, 15],  # Too many elements
                prompt="Test",
                options=[]
            )
    
    def test_invalid_age_range_order(self):
        """Test node with reversed age_range."""
        with pytest.raises(ValidationError):
            StoryNode(
                title="Scene 1",
                lesson_key="test",
                age_range=[15, 5],  # Reversed
                prompt="Test",
                options=[]
            )


class TestStoryProgress:
    """Tests for StoryProgress model."""
    
    def test_valid_progress(self):
        """Test creating valid story progress."""
        progress = StoryProgress(
            user_id="user_123",
            story_id="story_1",
            current_node="node_1",
            completed_nodes=["node_0"],
            total_xp=50
        )
        assert progress.user_id == "user_123"
        assert progress.total_xp == 50
        assert progress.level == 1  # Default


class TestAdvanceRequest:
    """Tests for AdvanceRequest model."""
    
    def test_valid_advance_request(self):
        """Test creating valid advance request."""
        request = AdvanceRequest(
            user_id="user_123",
            story_id="story_1",
            current_node_id="node_1",
            choice_index=0,
            age=9
        )
        assert request.user_id == "user_123"
        assert request.choice_index == 0
    
    def test_invalid_age(self):
        """Test advance request with invalid age."""
        with pytest.raises(ValidationError):
            AdvanceRequest(
                user_id="user_123",
                story_id="story_1",
                current_node_id="node_1",
                choice_index=0,
                age=25  # Out of range
            )


class TestPayoutRequest:
    """Tests for PayoutRequest model."""
    
    def test_valid_payout_request(self):
        """Test creating valid payout request."""
        request = PayoutRequest(
            user_id="user_123",
            wallet_address="rXXX...",
            token="eTask",
            amount=0.5,
            reason="chapter_completion",
            story_id="story_1"
        )
        assert request.token == "eTask"
        assert request.amount == 0.5
    
    def test_invalid_amount(self):
        """Test payout request with invalid amount."""
        with pytest.raises(ValidationError):
            PayoutRequest(
                user_id="user_123",
                wallet_address="rXXX...",
                token="eTask",
                amount=0,  # Must be > 0
                reason="chapter_completion"
            )


class TestRecommendRequest:
    """Tests for RecommendRequest model."""
    
    def test_valid_recommend_request(self):
        """Test creating valid recommend request."""
        request = RecommendRequest(
            user_id="user_123",
            age=9,
            story_id="story_1",
            current_node_id="node_1",
            history=["node_0"],
            candidate_nodes=["node_2", "node_3"]
        )
        assert request.user_id == "user_123"
        assert len(request.candidate_nodes) == 2


class TestHealthResponse:
    """Tests for HealthResponse model."""
    
    def test_valid_health_response(self):
        """Test creating valid health response."""
        response = HealthResponse(
            status="healthy",
            service="test-service",
            version="0.1.0",
            timestamp=datetime.utcnow()
        )
        assert response.status == "healthy"
        assert response.version == "0.1.0"
