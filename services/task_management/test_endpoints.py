from fastapi import FastAPI
import pytest
from fastapi.testclient import TestClient

from schema import TaskCreated, TaskAssigned, TaskCancelled, TaskCommentAdded, TaskCompleted, TaskExpired, TaskRatingUpdate, TaskRewarded, TaskUpdated, TaskVerified

app = FastAPI()
@pytest.fixture
def client():
    return TestClient(app,base_url="http://0.0.0.0:8080")


def test_hello(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "It's running!", "Service": "Unknown service", "Revision": "Unknown revision"}


def test_task_event(client):
    payload = {
        "event_id": "1",
        "event_type": "TaskCreated",
        "timestamp": "2023-05-19T10:00:00Z",
        "task_id": "12345",
        "user_id": "user1",
        "status": "created",
        "additional_data": {
            "task_title": "Task 1",
            "task_description": "Description of Task 1",
            "task_id": "12345",
            "expiration_date": 1678924800,
            "reward_amount": 10.0,
            "reward_currency": "USD",
            "payment_method": "Pay directly",
            "user_id": "user1",
            "project_id": "project1",
            "project_name": "Project 1",
            "requires_attachments": False,
            "terms_blob": "Terms and conditions",
            "terms_id": "terms1",
            "rating": None,
            "assigned_to_ids": None,
            "rewarded": None,
            "marked_completed": None,
            "auto_verify": None
        }
    }
    response = client.post("/TaskEvent", json=payload)
    assert response.status_code == 200
    # assert response.json() == {"message": "Task event created successfully"}


def test_task_created(client):
    payload = {
        "task_title": "Task 1",
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
        "auto_verify": None
    }
    response = client.post("/TaskCreated", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task created successfully"}


def test_task_assigned(client):
    payload = {
        "task_id": "12345",
        "assigned_to_id": "user2"
    }
    response = client.post("/TaskAssigned", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task assigned successfully"}


def test_task_cancelled(client):
    payload = {
        "task_id": "12345"
    }
    response = client.post("/TaskCancelled", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task cancelled successfully"}


def test_task_comment_added(client):
    payload = {
        "task_id": "12345",
        "user_id": "user1",
        "comment": "This is a comment"
    }
    response = client.post("/TaskCommentAdded", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task comment added successfully"}


def test_task_completed(client):
    payload = {
        "task_id": "12345",
        "completed_by_id": "user1",
        "attachments": None,
        "marked_completed": True,
        "verified": None,
        "verification_method": None
    }
    response = client.post("/TaskCompleted", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task completed successfully"}


def test_task_expired(client):
    payload = {
        "task_id": "12345"
    }
    response = client.post("/TaskExpired", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task expired successfully"}


def test_task_rating_update(client):
    payload = {
        "task_id": "12345",
        "user_id": "user1"
    }
    response = client.post("/TaskRatingUpdate", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task rating updated successfully"}


def test_task_rewarded(client):
    payload = {
        "task_id": "12345",
        "user_id": "user1"
    }
    response = client.post("/TaskRewarded", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task rewarded successfully"}


def test_task_updated(client):
    payload = {
        "task_id": "12345",
        "updated_fields": {"task_title": "Updated Task Title"}
    }
    response = client.post("/TaskUpdated", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task updated successfully"}


def test_task_verified(client):
    payload = {
        "task_id": "12345",
        "verified": True,
        "verification_method": "user"
    }
    response = client.post("/TaskVerified", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "Task verified successfully"}


def test_get_all_tasks(client):
    response = client.get("/tasks?user_id=user1")
    assert response.status_code == 200
    assert "docs" in response.json()


# Run the tests
if __name__ == "__main__":
    pytest.main()
