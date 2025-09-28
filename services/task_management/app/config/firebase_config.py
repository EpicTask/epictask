import os
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase configuration
# credentials_path = os.getenv('CREDENTIALS_PATH')
# cred = credentials.Certificate(credentials_path)


# Initialize Firestore client
app = firebase_admin.initialize_app()
db = firestore.client()