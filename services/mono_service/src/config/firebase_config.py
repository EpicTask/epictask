"""Firebase configuration for Adaptive Narrative Engine."""

import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client


# Initialize Firebase Admin SDK
def initialize_firebase() -> Client:
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        # Check for service account credentials
        service_account_path = os.getenv("CREDENTIALS_PATH")

        # Unset is the normal case on Cloud Run and in tests — fall through to
        # application default credentials rather than stat'ing None.
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            app = firebase_admin.initialize_app(credential=cred)
        else:
            # Use default credentials (for Cloud Run)
            app = firebase_admin.initialize_app()

    return firestore.client(app=app)

# Global Firestore client
db = initialize_firebase()
