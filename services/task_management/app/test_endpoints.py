"""Test the main.py file"""
import pytest
import time
from fastapi.testclient import TestClient

from .main import app

client = TestClient(app)


class TestTaskManagement:
    """Test class for task management endpoints"""
    
    @pytest.fixture(scope="class")
    def task_id(self):
        """Create a test task and return its ID"""
        # Create a task to get the actual document ID
        payload = {
            "task_description": "Description of Test Task",
            "task_id": "test-task-12345",  # This will be overwritten by the database
            "expiration_date": 1678924800,
            "reward_amount": 10.0,
            "reward_currency": "USD",
            "payment_method": "Pay directly",
            "user_id": "user1",
            "task_title": "Test Task 1",
            "requires_attachments": False,
        }
        response = client.post("/TaskCreated", json=payload)
        assert response.status_code == 200
        
        # TaskCreated now returns the doc_id directly
        doc_id = response.json()
        assert doc_id and isinstance(doc_id, str)
        
        time.sleep(1)  # Brief delay for database consistency
        return doc_id

    def get_task(self, task_id):
        """Helper method to get task by ID"""
        response = client.get(f"/get_task/{task_id}")
        if response.status_code == 200:
            return response.json()["response"]
        return None

    # def test_hello_endpoint(self):
    #     """Test the root endpoint"""
    #     response = client.get("/")
    #     assert response.status_code == 200
    #     assert "This service is running!" in response.text

    def test_task_created(self, task_id):
        """Test the TaskCreated endpoint"""
        assert task_id and isinstance(task_id, str)

    def test_get_task(self, task_id):
        """Test the get_task endpoint"""
        response = client.get(f"/get_task/{task_id}")
        assert response.status_code == 200
        assert response.json()["response"]["task_id"] == task_id

    def test_task_assigned(self, task_id):
        """Test the TaskAssigned endpoint"""
        payload = {"task_id": task_id, "assigned_to_id": "user2"}
        response = client.post("/TaskAssigned", json=payload)
        assert response.status_code == 200
        
        task = self.get_task(task_id)
        assert task["assigned_to_ids"][0] == "user2"

    def test_task_comment_added(self, task_id):
        """Test the TaskCommentAdded endpoint"""
        payload = {"task_id": task_id, "user_id": "user1", "comment": "This is a comment"}
        response = client.post("/TaskCommentAdded", json=payload)
        assert response.status_code == 200

    def test_task_expired(self, task_id):
        """Test the TaskExpired endpoint"""
        payload = {"task_id": task_id}
        response = client.post("/TaskExpired", json=payload)
        assert response.status_code == 200

    def test_task_rating_update(self, task_id):
        """Test the TaskRatingUpdate endpoint"""
        payload = {"task_id": task_id, "user_id": "user1"}
        response = client.post("/TaskRatingUpdate", json=payload)
        assert response.status_code == 200
        
        task = self.get_task(task_id)
        assert task["rating"] == 1  # Rating is incremented by 1

    def test_task_updated(self, task_id):
        """Test the TaskUpdated endpoint"""
        payload = {
            "task_id": task_id,
            "user_id": "user1",
            "updated_fields": {"task_title": "Updated Task Title"},
        }
        response = client.post("/TaskUpdated", json=payload)
        assert response.status_code == 200
        
        task = self.get_task(task_id)
        assert task["task_title"] == "Updated Task Title"

    def test_task_completed(self, task_id):
        """Test the TaskCompleted endpoint"""
        payload = {
            "task_id": task_id,
            "completed_by_id": "user1",
            "attachments": [],
            "marked_completed": True,
            "verified": False,
            "verification_method": "user",
        }
        response = client.post("/TaskCompleted", json=payload)
        assert response.status_code == 200
        
        task = self.get_task(task_id)
        assert task["marked_completed"] is True

    def test_task_verified(self, task_id):
        """Test the TaskVerified endpoint"""
        # Test marking as verified
        payload = {"task_id": task_id, "verified": True, "verification_method": "user", "user_id": "user1"}
        response = client.post("/TaskVerified", json=payload)
        assert response.status_code == 200
        
        task = self.get_task(task_id)
        assert task["verified"] is True
        
        # Test marking as unverified
        payload = {"task_id": task_id, "verified": False, "verification_method": "user", "user_id": "user1"}
        response = client.post("/TaskVerified", json=payload)
        assert response.status_code == 200
        
        task = self.get_task(task_id)
        assert task["verified"] is False

    def test_task_rewarded(self, task_id):
        """Test the TaskRewarded endpoint"""
        payload = {"task_id": task_id, "user_id": "user1"}
        response = client.post("/TaskRewarded", json=payload)
        assert response.status_code == 200

    def test_task_cancelled(self, task_id):
        """Test the TaskCancelled endpoint"""
        payload = {"task_id": task_id}
        response = client.post("/TaskCancelled", json=payload)
        assert response.status_code == 200


# class TestUserEndpoints:
#     """Test class for user-related endpoints"""

#     def test_get_all_tasks(self):
#         """Test the get all tasks endpoint"""
#         response = client.get("/tasks?user_id=user1")
#         assert response.status_code == 200
#         assert "responses" in response.json()

#     def test_get_task_summary(self):
#         """Test the get task summary endpoint"""
#         response = client.get("/user/user1/task-summary")
#         assert response.status_code == 200

#     def test_get_kid_task_summary(self):
#         """Test the get kid task summary endpoint"""
#         response = client.get("/user/user1/kid-task-summary")
#         assert response.status_code == 200

#     def test_get_recent_tasks(self):
#         """Test the get recent tasks endpoint"""
#         # This test may fail due to missing database indexes in test environment
#         try:
#             response = client.get("/user/user1/recent-tasks")
#             assert response.status_code == 200
#         except Exception as e:
#             # Skip test if database indexes are not configured
#             pytest.skip(f"Database index required: {str(e)}")

#     def test_get_recent_tasks_with_params(self):
#         """Test the get recent tasks endpoint with parameters"""
#         # This test may fail due to missing database indexes in test environment
#         try:
#             response = client.get("/user/user1/recent-tasks?limit=10&days=14")
#             assert response.status_code == 200
#         except Exception as e:
#             # Skip test if database indexes are not configured
#             pytest.skip(f"Database index required: {str(e)}")

    # def test_get_user_rewards(self):
    #     """Test the get user rewards endpoint"""
    #     response = client.get("/user/user1/rewards")
    #     assert response.status_code == 200

    # def test_get_children_rewards(self):
    #     """Test the get children rewards endpoint"""
    #     response = client.get("/parent/parent1/children-rewards")
    #     assert response.status_code == 200


# class TestLeaderboardEndpoints:
#     """Test class for leaderboard endpoints"""

    # def test_get_global_leaderboard(self):
    #     """Test the get global leaderboard endpoint"""
    #     response = client.get("/leaderboard/global")
    #     assert response.status_code == 200

    # def test_update_leaderboard(self):
    #     """Test the UpdateLeaderboard endpoint"""
    #     payload = {
    #         "task_title": "Leaderboard Test Task",
    #         "task_description": "Test task for leaderboard",
    #         "task_id": "leaderboard-test-123",
    #         "expiration_date": 1678924800,
    #         "reward_amount": 5.0,
    #         "reward_currency": "USD",
    #         "payment_method": "Pay directly",
    #         "user_id": "user1",
    #         "assigned_to_ids": ["user1"],  # Required field for leaderboard update
    #     }
    #     response = client.post("/UpdateLeaderboard", json=payload)
    #     assert response.status_code == 200


class TestAdminEndpoints:
    """Test class for admin endpoints"""

    def test_get_user_metrics(self):
        """Test the get user metrics endpoint"""
        response = client.get("/admin/metrics/users")
        assert response.status_code == 200

    def test_get_task_metrics(self):
        """Test the get task metrics endpoint"""
        response = client.get("/admin/metrics/tasks")
        assert response.status_code == 200

    def test_get_event_metrics(self):
        """Test the get event metrics endpoint"""
        response = client.get("/admin/metrics/events")
        assert response.status_code == 200

    def test_get_performance_metrics(self):
        """Test the get performance metrics endpoint"""
        response = client.get("/admin/metrics/performance")
        assert response.status_code == 200

    def test_clear_test_data(self):
        """Test the clear test data endpoint"""
        response = client.post("/admin/clear-test-data")
        assert response.status_code == 200


# Run the tests
if __name__ == "__main__":
    pytest.main([__file__])
