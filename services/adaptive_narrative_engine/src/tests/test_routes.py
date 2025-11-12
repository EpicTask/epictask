"""Unit tests for API routes."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock

from src.main import app
from src.domain.models import Story, StoryNode

client = TestClient(app)


class TestStoryRoutes:
    """Tests for story routes."""
    
    @patch('src.routes.stories.firestore_service')
    @patch('src.routes.stories.get_current_user')
    async def test_get_stories_success(self, mock_auth, mock_firestore):
        """Test getting all stories."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_firestore.get_all_stories = AsyncMock(return_value=[
            {
                "story_id": "story_1",
                "title": "Test Story",
                "age_min": 5,
                "age_max": 10,
                "published": True,
                "tags": ["test"],
                "version": 1
            }
        ])
        
        response = client.get(
            "/stories",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 200
        assert len(response.json()) == 1
    
    @patch('src.routes.stories.firestore_service')
    @patch('src.routes.stories.get_current_user')
    async def test_get_story_not_found(self, mock_auth, mock_firestore):
        """Test getting a non-existent story."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_firestore.get_story = AsyncMock(return_value=None)
        
        response = client.get(
            "/stories/nonexistent",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 404
    
    @patch('src.routes.stories.firestore_service')
    @patch('src.routes.stories.get_current_user')
    async def test_get_node_success(self, mock_auth, mock_firestore):
        """Test getting a story node."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_firestore.get_story = AsyncMock(return_value={
            "story_id": "story_1",
            "title": "Test Story",
            "published": True
        })
        mock_firestore.get_node = AsyncMock(return_value={
            "node_id": "node_1",
            "title": "Test Node",
            "lesson_key": "test",
            "age_range": [8, 12],
            "prompt": "Test prompt",
            "options": [],
            "is_terminal": False,
            "order": 0
        })
        
        response = client.get(
            "/stories/story_1/nodes/node_1?age=10",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 200
        assert response.json()["node_id"] == "node_1"
    
    @patch('src.routes.stories.firestore_service')
    @patch('src.routes.stories.get_current_user')
    async def test_get_node_age_inappropriate(self, mock_auth, mock_firestore):
        """Test getting a node that's not age-appropriate."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_firestore.get_story = AsyncMock(return_value={
            "story_id": "story_1",
            "published": True
        })
        mock_firestore.get_node = AsyncMock(return_value={
            "node_id": "node_1",
            "age_range": [15, 18],
            "options": []
        })
        
        response = client.get(
            "/stories/story_1/nodes/node_1?age=10",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 403


class TestProgressRoutes:
    """Tests for progress routes."""
    
    @patch('src.routes.progress.firestore_service')
    @patch('src.routes.progress.get_current_user')
    @patch('src.routes.progress.get_user_id')
    async def test_advance_progress_success(self, mock_user_id, mock_auth, mock_firestore):
        """Test advancing progress successfully."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_firestore.get_story = AsyncMock(return_value={
            "story_id": "story_1",
            "published": True
        })
        mock_firestore.get_node = AsyncMock(side_effect=[
            {
                "node_id": "node_1",
                "options": [
                    {"text": "Choice 1", "leads_to": "node_2", "reward_xp": 10}
                ]
            },
            {
                "node_id": "node_2",
                "payout_hint": None
            }
        ])
        mock_firestore.get_progress = AsyncMock(return_value=None)
        mock_firestore.create_or_update_progress = AsyncMock()
        
        response = client.post(
            "/progress/advance",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "user_id": "user_123",
                "story_id": "story_1",
                "current_node_id": "node_1",
                "choice_index": 0,
                "age": 10
            }
        )
        
        assert response.status_code == 200
        assert response.json()["next_node_id"] == "node_2"
        assert response.json()["xp_awarded"] == 10
    
    @patch('src.routes.progress.firestore_service')
    @patch('src.routes.progress.get_current_user')
    @patch('src.routes.progress.get_user_id')
    async def test_advance_progress_invalid_choice(self, mock_user_id, mock_auth, mock_firestore):
        """Test advancing with invalid choice index."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_firestore.get_story = AsyncMock(return_value={
            "story_id": "story_1",
            "published": True
        })
        mock_firestore.get_node = AsyncMock(return_value={
            "node_id": "node_1",
            "options": [
                {"text": "Choice 1", "leads_to": "node_2", "reward_xp": 10}
            ]
        })
        
        response = client.post(
            "/progress/advance",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "user_id": "user_123",
                "story_id": "story_1",
                "current_node_id": "node_1",
                "choice_index": 5,  # Invalid index
                "age": 10
            }
        )
        
        assert response.status_code == 400
    
    @patch('src.routes.progress.firestore_service')
    @patch('src.routes.progress.get_current_user')
    @patch('src.routes.progress.get_user_id')
    async def test_get_progress_success(self, mock_user_id, mock_auth, mock_firestore):
        """Test getting user progress."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_firestore.get_progress = AsyncMock(return_value={
            "current_node": "node_2",
            "completed_nodes": ["node_1"],
            "total_xp": 25,
            "level": 1
        })
        
        response = client.get(
            "/progress/user_123/story_1",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 200
        assert response.json()["current_node"] == "node_2"
    
    @patch('src.routes.progress.firestore_service')
    @patch('src.routes.progress.get_current_user')
    @patch('src.routes.progress.get_user_id')
    async def test_get_progress_not_found(self, mock_user_id, mock_auth, mock_firestore):
        """Test getting progress that doesn't exist."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_firestore.get_progress = AsyncMock(return_value=None)
        
        response = client.get(
            "/progress/user_123/story_1",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 404
    
    @patch('src.routes.progress.firestore_service')
    @patch('src.routes.progress.get_current_user')
    @patch('src.routes.progress.get_user_id')
    async def test_get_progress_unauthorized(self, mock_user_id, mock_auth, mock_firestore):
        """Test getting progress for another user."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        response = client.get(
            "/progress/user_456/story_1",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 403


class TestHealthEndpoint:
    """Tests for health endpoint."""
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "adaptive-narrative-engine"
    
    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        
        assert response.status_code == 200
        assert "service" in response.json()
        assert "version" in response.json()
