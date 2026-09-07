from firebase_admin import firestore
from ..domain.xrpl_models import XrplLogEvent
from ..config.error_handler import handle_firestore_exception, FirestoreOperationException
from ..config.firebase_config import db

from ..config.logging_config import get_logger

logger = get_logger(__name__)

def write_xrpl_event_to_firestore(event: XrplLogEvent):
    """Store the XRPL event in Firestore database"""
    try:
        # Use a generic collection or configurable one
        collection_name = "test_xrpl_service"
        collection_ref = db.collection(collection_name)

        # We mimic the original xrpl_management DB logic:
        # Save response
        doc_ref = collection_ref.document()
        doc_ref.set(event.response)
        doc_id = doc_ref.id

        # Update document with docRef.id logic
        doc_ref.update({
            "doc_id": doc_id,
            "function": event.function,
            "task_id": event.task_id,
            "timestamp": firestore.SERVER_TIMESTAMP,
        })

        return doc_id
    except Exception as e:
        # Re-raise as custom exception or handle
        logger.error(f"Error adding document: {e}")
        return None
