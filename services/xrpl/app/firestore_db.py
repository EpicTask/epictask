import json
from google.cloud import firestore
import datetime

def write_response_to_firestore(response, function):
    try:
        # Initialize Firestore client
        db = firestore.Client()

        # Create a reference to the "xrpl_service" collection
        collection_ref = db.collection('xrpl_service')

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Set the response data in the document
        doc_ref.set(response)

        # Get the generated document ID
        doc_id = doc_ref.id

        # Update the document with the generated ID
        doc_ref.update({
            'doc_id': doc_id,
            "function":function,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        # Return the custom document ID
        return doc_id

    except Exception as e:
        # Handle any errors that occur during the Firestore operation
        print(f"Error writing to Firestore: {e}")
        return None




