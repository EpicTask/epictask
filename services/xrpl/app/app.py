"""
A sample Hello World server.
"""
import os
import xumm
import json
import asyncio
import nest_asyncio
from flask import Flask, render_template, request
from dotenv import load_dotenv

load_dotenv()
# pylint: disable=C0103
app = Flask(__name__)

api_key = os.environ.get('API_KEY')
api_secret = os.environ.get('API_SECRET')
sdk = xumm.XummSdk(api_key, api_secret)

async def send_payment_request(amount, source, destination, payment_reference):
    url = ''
    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "Payment",
            "Account": source,
            "Destination": destination,
            "Amount" : str(amount),
        },
        "Fee":"12",
        "options": {
            "expire": 3
        },
        "user_token":"f53f2b43-a000-47fc-bcd8-d4f5acf9d234"
    }
    
    # Create the payment request with the XUMM SDK
    
    try:
        subscription = sdk.payload.create(xumm_payload)
        print(json.dumps(subscription.to_dict(), indent=4, sort_keys=True))
        url = '{}'.format(subscription.next.always)
        return url
    except Exception as e:
        print(f"Error creating subscription: {e}")
        # Handle the error as appropriate
        return url
 

async def send_payment_request_no_user_token(amount, source, destination, payment_reference):

    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "Payment",
            "Account": source,
            "Destination": destination,
            "Amount" : str(amount),
        },
        "Fee":"12",
        "options": {
            "expire": 1
        },
        "user_token":"f53f2b43-a000-47fc-bcd8-d4f5acf9d234"
    }
    
    def callback_func(event):
        print('New payload event: {}'.format(event['data']))

        if 'signed' in event['data']:
            print('Signed')
            return event['data']

    # Create the payment request with the XUMM SDK
    sdk = xumm.XummSdk(api_key, api_secret)
    pong = sdk.ping()
    print(pong)
    subscription = await sdk.payload.create_and_subscribe(
      xumm_payload,
      callback_func,
    )

    # Print the payment request URL
    print(json.dumps(subscription.created.to_dict(), indent=4, sort_keys=True))
    print('New payload created, URL: {}'.format(subscription.created.next.always))
    print('  > Pushed: {}'.format('yes' if subscription.created.pushed else 'no'))

    """
    Wait until the subscription resolves (by returning something)
    in the callback function.
    """
    resolve_data = await subscription.resolved()
    print(resolve_data)
    try:
        if resolve_data['signed'] == False:
            print('The sign request was rejected.')

        else:
            print('The sign request was approved.')
            """
            Fetch the full payload end result, and get the issued
            user token, we can use to send our next payload per Push notification
            """
            result = sdk.payload.get(resolve_data['payload_uuidv4'])
            print('User token: {}'.format(result.application.issued_user_token))
        
    except:
        print('Error')

@app.route('/')
def hello():
    """Return a friendly HTTP greeting."""
    message = "It's running!"

    """Get Cloud Run environment variables."""
    service = os.environ.get('K_SERVICE', 'Unknown service')
    revision = os.environ.get('K_REVISION', 'Unknown revision')


    return render_template('index.html',
        message=message,
        Service=service,
        Revision=revision)

@app.route('/payment', methods=["Get", "POST"])
def process_payment():
    data = request.get_json()
    amount = data.get('amount')
    source = data.get('source')
    destination = data.get('destination')
    note = data.get('note')

    return initiate_payment(amount, source, destination, note)

def initiate_payment(amount, source, destination, note):
    try:
        asyncio.set_event_loop(asyncio.SelectorEventLoop())
        url = asyncio.get_event_loop().run_until_complete(send_payment_request(amount, source, destination, note))
        data = {'url': url}
    except RuntimeError as e:
        print(f"Error occurred: {e}")
        data = {'url': f"Error occurred: {e}"}
        return render_template('payment.html', data=data)

    return render_template('payment.html', data=data)

@app.route('/paymentTest', methods=["Get", "POST"])
def test_payment():
    try:
        asyncio.set_event_loop(asyncio.SelectorEventLoop())
        url = asyncio.get_event_loop().run_until_complete(send_payment_request(100000, 'rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF', 'rpaxHGQVgQSXF1HaKGRpLKm6X7eh26v6eV', 'test payment request'))
        data = {'url': url}
    except RuntimeError as e:
        print(f"Error occurred: {e}")
        data = {'url': f"Error occurred: {e}"}
        return render_template('payment.html', data=data)

    return render_template('payment.html', data=data)

@app.route('/paymentForm', methods=["Get", "POST"])
def paymentForm():
    return render_template('payment_form.html')


if __name__ == '__main__':
    server_port = os.environ.get('PORT', '8080')
    app.run(debug=False, port=server_port, host='0.0.0.0')
