from google.cloud import exceptions

class FirestoreOperationException(Exception):
    """Custom exception for Firestore operations."""


def handle_firestore_exception(e):
    """Handle exceptions raised by Firestore operations"""
    if isinstance(e, exceptions.Unauthorized):
        return {"error": f"Unauthorized request to Firestore: {str(e)}"}
    elif isinstance(e, exceptions.BadRequest):
        return {"error": f"Error writing to Firestore: {str(e)}"}
    elif isinstance(e, exceptions.Forbidden):
        return {"error": f"Error writing to Firestore: {str(e)}"}
    elif isinstance(e, exceptions.GoogleCloudError):
        return {"error": f"Google cloud error while writing to Firestore: {str(e)}"}
    else:
        return {"error": f"An unexpected error occurred: {str(e)}"}
