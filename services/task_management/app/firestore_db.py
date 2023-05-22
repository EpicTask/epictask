import json
from google.cloud import firestore


def write_response_to_firestore(response):
    try:
        # Initialize Firestore client
        db = firestore.Client()

        # Create a reference to the "test_task_events" collection
        collection_ref = db.collection('test_task_events')

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
            'task_id': doc_id,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None




