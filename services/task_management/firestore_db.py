import json
from google.cloud import firestore

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
        write_event_to_firestore('TaskCreated', doc_id, data)
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
        write_event_to_firestore(event_type, doc_id, data)
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
        write_event_to_firestore(event_type, doc_id, data)
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
       # Delete document
        collection_ref.document(doc_id).delete()

        write_event_to_firestore(event_type, doc_id, data)
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

        write_event_to_firestore(event_type, doc_id, data)
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
        write_event_to_firestore(event_type, doc_id, data)
        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None


def write_event_to_firestore(event_type, task_id, response):
    try:
        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_task_events')

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Get the generated document ID
        doc_id = doc_ref.id

        # Update the document with the generated ID
        doc_ref.set({
            'event_id': doc_id,
            'event_type': event_type,
            'task_id': task_id,
            # 'user_id': response["user_id"] if response["user_id"] is not None else None,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'status': "success",
            'additional_data': response
        })

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None
