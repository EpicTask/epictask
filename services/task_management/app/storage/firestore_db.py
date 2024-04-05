from google.cloud import firestore

from schema.schema import TaskCreated, LeaderboardEntry, TaskEvent
from config.error_handler import (
    FirestoreOperationException,
    handle_firestore_exception,
)

# Initialize Firestore client
db = firestore.Client()


def create_task(response: TaskCreated):
    """Store new task in Firestore database"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_tasks")

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        # Set the response data in the document
        doc_ref.set(data)

        # Get the generated document ID
        doc_id = doc_ref.id

        # Update the document with the generated ID
        doc_ref.update(
            {
                "rating": 0,
                "rewarded": False,
                "task_id": doc_id,
                "timestamp": firestore.SERVER_TIMESTAMP,
            }
        )

        # Return the custom document ID
        return doc_id
    # Handle any errors that occur during the Firestore operation
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def update_task(response):
    """Update the fields of a task"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_tasks")

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.update(data)

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def update_task_fields(response):
    """Update the fields of a task"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_tasks")

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        fields = data["updated_fields"]
        # Update the document with the generated ID
        doc_ref.update(fields)

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def assign_task(response):
    """Assign a task to a user"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_tasks")

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]

        # Add the assigned_to_id to the assigned_to_ids array
        assigned_to_id = data["assigned_to_id"]

        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.update({"assigned_to_ids": firestore.ArrayUnion([assigned_to_id])})

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def delete_task(response):
    """Delete a task from the Firestore database"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_tasks")

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]

        # Check if "smart_contract_enabled" field exists and its value is true
        doc_ref = collection_ref.document(doc_id)
        doc = doc_ref.get().to_dict()

        if (
            doc.get("smart_contract_enabled")
            and doc.get("smart_contract_enabled") is True
        ):
            return "Unable to delete Task due to active smart contract"

        # Delete document
        doc_ref.delete()

        return doc_id

    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def completed_task(response):
    """Mark a task as completed"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_tasks")

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        doc_ref = collection_ref.document(doc_id)

        # Get the user_id field from the document
        # doc_data = doc_ref.get().to_dict()
        # doc_user_id = doc_data["user_id"]

        # Check if the user_id is task owner
        if data["verified"] is None or data["verified"] is False:
            doc_ref.update({"marked_completed": data["marked_completed"]})

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def get_tasks(user_id: str):
    """Get all tasks"""
    doc_output = []
    try:
        task_events = db.collection("test_tasks").where("user_id", "==", user_id)
        docs = task_events.stream()

        for doc in docs:
            doc_output.append(doc.to_dict())

        return {"docs": doc_output}

    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def get_task(task_id: str):
    """Get task by task ID"""
    try:
        task_event = db.collection("test_tasks").document(task_id)
        doc = task_event.get()

        if doc.exists:
            doc_output = doc.to_dict()
            return doc_output
        return "No task found with the given task_id"

    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


# Write comments to comments collection


def write_comment(response):
    """Add comment to the Firestore database"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_task_comments")

        # Convert the TaskEvent object to a JSON string
        data = response.dict()
        # Get task_id to create/update document
        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.set(data)
        # Update the document with the generated ID
        doc_ref.update({"timestamp": firestore.SERVER_TIMESTAMP})

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def write_event_to_firestore(response: TaskEvent):
    """Store the event in Firestore database"""
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection("test_task_events")

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Update the document with the generated ID
        doc_ref.set(data)

        doc_ref.update(
            {"event_id": doc_ref.id, "timestamp": firestore.SERVER_TIMESTAMP}
        )
        # Return the custom document ID
        return doc_ref.id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


# Leaderboard logic


def update_leaderboard(response):
    """Update the leaderboard for the user"""
    try:
        # Get the paid task document data
        task_data = response

        # Get the first value from assigned_to_ids array
        assigned_to_id = task_data.assigned_to_ids[0]

        # Increment the task count for the user in the leaderboard
        leaderboard_ref = db.collection("test_leaderboard").document(assigned_to_id)

        leaderboard_entry = leaderboard_ref.get()

        if leaderboard_entry.exists:
            # Update existing entry
            current_tasks_completed = leaderboard_entry.get("tasks_completed")
            tasks_completed = current_tasks_completed + 1
            if task_data.reward_currency == "XRP":
                xrp_earned = task_data.reward_amount + leaderboard_entry.get(
                    "xrp_earned"
                )
                eTask_earned = leaderboard_entry.get("eTask_earned")
            elif task_data.reward_currency == "eTask":
                eTask_earned = task_data.reward_amount + leaderboard_entry.get(
                    "eTask_earned"
                )
                xrp_earned = leaderboard_entry.get("xrp_earned")
            leaderboard_ref.update(
                {
                    "tasks_completed": tasks_completed,
                    "eTask_earned": eTask_earned,
                    "xrp_earned": xrp_earned,
                    "lastUpdated": firestore.SERVER_TIMESTAMP,
                }
            )
        else:
            # Create new entry
            if task_data.reward_currency == "XRP":
                xrp_earned = task_data.reward_amount
                eTask_earned = 0.0
            elif task_data.reward_currency == "eTask":
                eTask_earned = task_data.reward_amount
                xrp_earned = 0.0
            leaderboard_entry_data = LeaderboardEntry(
                user_id=assigned_to_id,
                tasks_completed=1,
                xrp_earned=xrp_earned,
                eTask_earned=eTask_earned,
            )
            leaderboard_ref.set(leaderboard_entry_data.dict())
            leaderboard_ref.update({"lastUpdated": firestore.SERVER_TIMESTAMP})

        return f"Leaderboard updated for user {assigned_to_id}"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)
