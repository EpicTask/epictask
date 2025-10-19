import os
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase local configuration
credentials_path = os.getenv('CREDENTIALS_PATH')
cred = credentials.Certificate(credentials_path)
app = firebase_admin.initialize_app(credential=cred)
db = firestore.client(app=app)

# Initialize Firestore client
# app = firebase_admin.initialize_app()
# db = firestore.client()