import asyncio
import json
from xrpl_models import PaymentRequest
import xumm
from google_secrets import get_secret
from websocket_handler import connection_manager
from starlette.responses import JSONResponse
from xrpl.clients import JsonRpcClient
from pydantic import BaseModel

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")


async def handle_payment_request(payment_request: PaymentRequest):
    return await send_payment_request_no_user_token(payment_request.amount, payment_request.source, payment_request.destination, payment_request.note)


async def send_payment_request(amount, source, destination, payment_reference):
    url = ''
    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "Payment",
            "Account": source,
            "Destination": destination,
            "Amount": str(amount),
        },
        "Fee": "12",
        "options": {
            "expire": 3
        },
        # "user_token": "f53f2b43-a000-47fc-bcd8-d4f5acf9d234"
    }

    # Create the payment request with the XUMM SDK

    try:
        subscription = sdk.payload.create(xumm_payload)
        response = json.dumps(subscription.to_dict(), indent=4, sort_keys=True)
        await connection_manager.send_update(response)
        # url = '{}'.format(subscription.next.always)
        return response
    except Exception as e:
        print(f"Error creating subscription: {e}")
        # Handle the error as appropriate
        return f"Error creating subscription: {e}"


async def send_payment_request_no_user_token(amount, source, destination, payment_reference):

    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "Payment",
            "Account": source,
            "Destination": destination,
            "Amount": str(amount),
        },
        "Fee": "12",
        "options": {
            "expire": 2
        },
    }

    def callback_func(event):
        print("Callback got here")
        try:
            event_status = 'New payload event: {}'.format(event['data'])
            print(event_status)
            # data_str = json.dumps(event['data'], indent=4, sort_keys=True)
            # await connection_manager.send_update(event_status)
            if 'expired' in event['data'] or 'signed' in event['data']:
                # payload is reolved return the data
                return event['data']
        except Exception as e:
            print(f"Error in callback_func: {e}")

    try:
        # Create the payment request with the XUMM SDK
        create_payload = sdk.payload.create(xumm_payload)
        print(create_payload.uuid)
        response = json.dumps(create_payload.to_dict(), indent=4, sort_keys=True)
        await connection_manager.send_update(response)

    except Exception as e:
        return f"Error: {e}"
    
        # start the websocket subscription on this payload and listen for changes
    try:
        subscription = await sdk.payload.subscribe(create_payload.uuid, callback_func)
        # wait for the payload to resolve
        print("Subscribe to payload")
        resolve_data = await subscription.resolved()
        # now we can cancel the subscription
        sdk.payload.unsubscribe()
    except RuntimeWarning as e:
        print(f"Caught RuntimeWarning: {e}")


    # subscription_resp = json.dumps(subscription.to_dict(), indent=4, sort_keys=True)
    get_payload = sdk.payload.get(resolve_data.payload_uuidv4)
    get_payload_resp = json.dumps(get_payload, indent=4, sort_keys=True)
    return get_payload_resp