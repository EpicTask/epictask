"""Test the main.py file"""
import pytest
import time
from fastapi.testclient import TestClient

from ..main import app

client = TestClient(app)


# Create test task
def task_created():
    """Test the TaskCreated endpoint"""
    payload = {
        "task_title": "Test Task 1",
        "task_description": "Description of Task 1",
        "task_id": "12345",
        "expiration_date": 1678924800,
        "reward_amount": 10.0,
        "reward_currency": "USD",
        "payment_method": "Pay directly",
        "user_id": "user1",
        "project_id": None,
        "project_name": None,
        "requires_attachments": False,
        "terms_blob": None,
        "terms_id": None,
        "rating": None,
        "assigned_to_ids": None,
        "rewarded": None,
        "marked_completed": None,
        "auto_verify": None,
    }
    response = client.post("/TaskCreated", json=payload)
    doc_id = str(response.json())
    return doc_id


DOC_ID = task_created()

# Add a 3 second delay
time.sleep(3)


# Check task has been created
def test_task_created():
    """Test the TaskCreated endpoint"""
    assert DOC_ID and isinstance(DOC_ID, str)


# Get task by task ID
def test_get_task():
    """Test the get_all_tasks endpoint"""
    response = client.get(f"get_task/{DOC_ID}")
    assert response.status_code == 200
    print(response.json())
    assert response.json()["response"]["task_id"] == DOC_ID


def get_task():
    """Test the get_all_tasks endpoint"""
    response = client.get(f"get_task/{DOC_ID}")
    return response.json()["response"]


# Assign task to user2
def test_task_assigned():
    """Test the TaskAssigned endpoint"""
    payload = {"task_id": DOC_ID, "assigned_to_id": "user2"}
    response = client.post("/TaskAssigned", json=payload)
    assert response.status_code == 200
    response = get_task()
    print(response)
    assert response["assigned_to_ids"] == ["user2"]


# Add comment to task
def test_task_comment_added():
    """Test the TaskCommentAdded endpoint"""
    payload = {"task_id": DOC_ID, "user_id": "user1", "comment": "This is a comment"}
    response = client.post("/TaskCommentAdded", json=payload)
    assert response.status_code == 200


# Change task to expired
def test_task_expired():
    """Test the TaskExpired endpoint"""
    payload = {"task_id": DOC_ID}
    response = client.post("/TaskExpired", json=payload)
    assert response.status_code == 200


# Update rating on task
def test_task_rating_update():
    """Test the TaskRatingUpdate endpoint"""
    payload = {"task_id": DOC_ID, "user_id": "user1"}
    response = client.post("/TaskRatingUpdate", json=payload)
    assert response.status_code == 200

    assert get_task()["rating"] == 0


# Perform update on task
def test_task_updated():
    """Test the TaskUpdated endpoint"""
    payload = {
        "task_id": DOC_ID,
        "updated_fields": {"task_title": "Updated Task Title"},
    }
    response = client.post("/TaskUpdated", json=payload)
    assert response.status_code == 200

    assert get_task()["task_title"] == "Updated Task Title"


# Mark task as completed
def test_task_completed():
    """Test the TaskCompleted endpoint"""

    payload = {
        "task_id": DOC_ID,
        "completed_by_id": "user1",
        "attachments": None,
        "marked_completed": True,
        "verified": None,
        "verification_method": None,
    }
    response = client.post("/TaskCompleted", json=payload)
    assert response.status_code == 200
    response = get_task()
    assert response["marked_completed"] is True


# Verify Task
def test_task_verified():
    """Test the TaskVerified endpoint"""
    payload = {"task_id": DOC_ID, "verified": True, "verification_method": "user"}
    response = client.post("/TaskVerified", json=payload)
    assert response.status_code == 200

    assert get_task()["verified"] is True
    # Change task to unverified
    payload = {"task_id": DOC_ID, "verified": False, "verification_method": "user"}
    client.post("/TaskVerified", json=payload)
    assert get_task()["verified"] is False


# Cancel Task
def test_task_cancelled():
    """Test the TaskCancelled endpoint"""

    payload = {"task_id": DOC_ID}
    response = client.post("/TaskCancelled", json=payload)
    assert response.status_code == 200

# Run the tests
if __name__ == "__main__":
    pytest.main()