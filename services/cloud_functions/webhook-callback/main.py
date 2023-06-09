from google.cloud import firestore
from google.cloud.firestore import SERVER_TIMESTAMP

# Initialize Firestore client
db = firestore.Client()

def webhook_callback(request):
    try:
        # Extract the callback data from the request payload
        callback_data = request.json

        # Extract the X-Signature header from the request
        user_agent_header = request.headers.get('user-agent')
        print(user_agent_header)
        # Verify the X-Signature
        user_agent = 'xumm-webhook'

        if user_agent_header != user_agent:
            print('Invalid. Request not from Xumm.')
            return

        # Save the callback data to Firestore
        db = firestore.Client()  # Initialize the Firestore client
        collection_ref = db.collection('test_xumm_callbacks')
        doc_ref = collection_ref.document()  # Create a new document reference
        doc_ref.set(callback_data)  # Set the document data

        # Update the created document with a server timestamp
        doc_ref.update({'timestamp': SERVER_TIMESTAMP})

        print('Callback data saved successfully:', callback_data)
        return
    except Exception as e:
        print('Failed to save callback data:', e)
        return
