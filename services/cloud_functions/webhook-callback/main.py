import functions_framework
from google.cloud import firestore

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
        # Replace with your Xumm webhook secret key
        user_agent = 'xumm-webhook'

        if user_agent_header != user_agent:
            print('Invalid. Request not from Xumm.')
            return

        # Save the callback data to Firestore
        # Replace this with your Firestore saving logic
        db.collection('test_xumm_callbacks').add(callback_data)

        print('Callback data saved successfully:', callback_data)
        return
    except Exception as e:
        print('Failed to save callback data:', e)
        return
