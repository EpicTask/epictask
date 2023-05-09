import asyncio
import json
import os

import xumm
from google_secrets import get_secret
from starlette.responses import JSONResponse
from xrpl.clients import JsonRpcClient

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")


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
        "user_token": "f53f2b43-a000-47fc-bcd8-d4f5acf9d234"
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
            "Amount": str(amount),
        },
        "Fee": "12",
        "options": {
            "expire": 1
        },
        "user_token": "f53f2b43-a000-47fc-bcd8-d4f5acf9d234"
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
    print('New payload created, URL: {}'.format(
        subscription.created.next.always))
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


def initiate_payment(amount, source, destination, note):
    try:
        asyncio.set_event_loop(asyncio.SelectorEventLoop())
        url = asyncio.get_event_loop().run_until_complete(
            send_payment_request(amount, source, destination, note))
        data = {'url': url}
    except RuntimeError as e:
        print(f"Error occurred: {e}")
        data = {'url': f"Error occurred: {e}"}
        return JSONResponse(data)

    return JSONResponse(data)
