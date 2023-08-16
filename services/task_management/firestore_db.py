import json
import requests
from google.cloud import firestore

from schema import TaskCreated, LeaderboardEntry, TaskEvent

# Initialize Firestore client
db = firestore.Client()


def create_task(response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_tasks')

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        # Set the response data in the document
        doc_ref.set(data)

        # Get the generated document ID
        doc_id = doc_ref.id

        # Update the document with the generated ID
        doc_ref.update({
            'rating': 0,
            'rewarded': False,
            'task_id': doc_id,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None


def update_task(event_type, response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_tasks')

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.update(data)

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None

def update_task_fields(event_type, response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_tasks')

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

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None


def assign_task(event_type, response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_tasks')

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]

        # Add the assigned_to_id to the assigned_to_ids array
        assigned_to_id = data['assigned_to_id']

        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.update({
            "assigned_to_ids": firestore.ArrayUnion([assigned_to_id])
        })

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None


def delete_task(event_type, response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_tasks')

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        
        # Check if "smart_contract_enabled" field exists and its value is true
        doc_ref = collection_ref.document(doc_id)
        doc = doc_ref.get().to_dict()
        
        if doc.get("smart_contract_enabled") and doc.get("smart_contract_enabled") == True:
            return "Unable to delete Task due to active smart contract"
        
        # Delete document
        doc_ref.delete()

        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error deleting Firestore document: {e}")
        return None


def completed_task(event_type, response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_tasks')

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        doc_ref = collection_ref.document(doc_id)

        # Get the user_id field from the document
        doc_data = doc_ref.get().to_dict()
        doc_user_id = doc_data["user_id"]

        # Check if the user_id is task owner
        if data["verified"] is None or data["verified"] is False:
            doc_ref.update({"marked_completed": data["marked_completed"]})

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None


def get_tasks(user_id: str):
    doc_output = []

    task_events = db.collection('test_tasks').where('user_id', '==', user_id)
    docs = task_events.stream()

    for doc in docs:
        doc_output.append(doc.to_dict())

    return {"docs": doc_output}

# Write comments to comments collection


def write_comment(event_type, response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_task_comments')

        # Convert the TaskEvent object to a JSON string
        data = response.dict()
        # Get task_id to create/update document
        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.set(data)
        # Update the document with the generated ID
        doc_ref.update({
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None


def write_event_to_firestore(response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_task_events')

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Update the document with the generated ID
        doc_ref.set(data)

        doc_ref.update({
            'event_id': doc_ref.id,
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        # Return the custom document ID
        return doc_ref.id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None

# Leaderboard logic


def update_leaderboard(response):
    try:
        # Get the paid task document data
        task_data = response

        # Get the first value from assigned_to_ids array
        assigned_to_id = task_data.assigned_to_ids[0]

        # Increment the task count for the user in the leaderboard
        leaderboard_ref = db.collection('test_leaderboard').document(assigned_to_id)

        leaderboard_entry = leaderboard_ref.get()

        if leaderboard_entry.exists:
            # Update existing entry
            current_tasks_completed = leaderboard_entry.get("tasks_completed")
            tasks_completed = current_tasks_completed + 1
            if task_data.reward_currency == 'XRP':
                xrp_earned = task_data.reward_amount + leaderboard_entry.get("xrp_earned")
                eTask_earned = leaderboard_entry.get("eTask_earned")
            elif task_data.reward_currency == 'eTask':
                eTask_earned = task_data.reward_amount + leaderboard_entry.get("eTask_earned")
                xrp_earned = leaderboard_entry.get("xrp_earned")
            leaderboard_ref.update({
                'tasks_completed': tasks_completed,
                'eTask_earned': eTask_earned,
                'xrp_earned': xrp_earned,
                'lastUpdated': firestore.SERVER_TIMESTAMP
            })
        else:
            # Create new entry
            if task_data.reward_currency == 'XRP':
                xrp_earned = task_data.reward_amount
                eTask_earned = 0.0
            elif task_data.reward_currency == 'eTask':
                eTask_earned = task_data.reward_amount
                xrp_earned = 0.0
            leaderboard_entry_data = LeaderboardEntry(
                user_id=assigned_to_id,
                tasks_completed=1,
                xrp_earned=xrp_earned,
                eTask_earned=eTask_earned
            )
            leaderboard_ref.set(leaderboard_entry_data.dict())
            leaderboard_ref.update({'lastUpdated': firestore.SERVER_TIMESTAMP})

        return f"Leaderboard updated for user {assigned_to_id}"
    except Exception as e:
        return f"Error updating leaderboard: {str(e)}"




# def generate_contract( params=None, data=None):
#     url = 'https://us-central1-task-coin-384722.cloudfunctions.net/generatContract'
#     headers = {'Content-Type': 'application/json'} 
#     json_data = json.dumps(data.dict()) if data is not None else None
#     print(data.dict())
#     try:
#         response = requests.request('POST', url, headers=headers, params=params, data=data.dict())
#         response.raise_for_status()  # Raise an exception for 4xx and 5xx status codes
#         return response.json() if response.headers.get('content-type') == 'application/json' else response.text
#     except requests.exceptions.RequestException as e:
#         print(f"Error making HTTP request: {e}")
#         return None