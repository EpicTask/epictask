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

        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            app = firebase_admin.initialize_app(credential=cred)
        else:
            # Use default credentials (for Cloud Run or local ADC)
            try:
                app = firebase_admin.initialize_app()
            except Exception as e:
                # Fallback to default firestore client if admin initialization fails
                # This can happen if ADC is not fully configured for admin SDK
                return firestore.client()

    return firestore.client(app=app)

# Global Firestore client
db = initialize_firebase()
