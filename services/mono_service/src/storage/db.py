"""
Unified Database Module for Monorepo Service.
Aggregates storage operations from Narrative, Tasks, and User domains.
"""
from ..config.firebase_config import db as firestore_client
from ..config.collection_names import collections

# Import storage modules
from . import narrative_firestore
from . import firestore_db as task_db
from . import user_db

# Shared utilities can go here

def get_db():
    """Get the Firestore client instance."""
    return firestore_client

def get_collections():
    """Get the collections configuration."""
    return collections
