import pytest
from app import app
from fastapi.testclient import TestClient

@pytest.fixture
def client():
    return TestClient(app)

def test_hello(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.template.name == "index.html"
    assert "This service is running!" in response.text

# Create test task
@pytest.fixture
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
    docId = str(response.json())
    return docId

# Assign task to user2
def test_task_assigned(client, test_task_created):
    docId = test_task_created  # Access the docId value from the test_task_created fixture
    payload = {
        "task_id": docId,
        "assigned_to_id": "user2"
    }
    response = client.post("/TaskAssigned", json=payload)
    assert response.status_code == 200
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)

# Add comment to task
def test_task_comment_added(client, test_task_created):
    docId = test_task_created
    payload = {
        "task_id": docId,
        "user_id": "user1",
        "comment": "This is a comment"
    }
    response = client.post("/TaskCommentAdded", json=payload)
    assert response.status_code == 200
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)

# Mark task as completed
def test_task_completed(client, test_task_created):
    docId = test_task_created
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
    payload2 = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload2)

# Change task to expired
def test_task_expired(client, test_task_created):
    docId = test_task_created
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskExpired", json=payload)
    assert response.status_code == 200
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)

# Update rating on task
def test_task_rating_update(client, test_task_created):
    docId = test_task_created
    payload = {
        "task_id": docId,
        "user_id": "user1"
    }
    response = client.post("/TaskRatingUpdate", json=payload)
    assert response.status_code == 200
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)

# Update task to rewarded
def test_task_rewarded(client, test_task_created):
    docId = test_task_created
    payload = {
        "task_id": "12345",
        "user_id": "user1"
    }
    response = client.post("/TaskRewarded", json=payload)
    assert response.status_code == 200
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)

# Perform update on task
def test_task_updated(client, test_task_created):
    docId = test_task_created
    payload = {
        "task_id": docId,
        "updated_fields": {"task_title": "Updated Task Title"}
    }
    response = client.post("/TaskUpdated", json=payload)
    assert response.status_code == 200
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)

# Verify Task
def test_task_verified(client, test_task_created):
    docId = test_task_created
    payload = {
        "task_id": "12345",
        "verified": True,
        "verification_method": "user"
    }
    response = client.post("/TaskVerified", json=payload)
    assert response.status_code == 200
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)

# Cancel Task
def test_task_cancelled(client, test_task_created):
    docId = test_task_created  
    payload = {
        "task_id": docId
    }
    response = client.post("/TaskCancelled", json=payload)
    assert response.status_code == 200


# Run the tests
if __name__ == "__main__":
    pytest.main()
