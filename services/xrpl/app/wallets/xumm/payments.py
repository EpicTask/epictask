import json


from xrpl.utils import xrp_to_drops
from config.client import XRPLClient, Xumm_SDK
from firebase.firestore_db import write_response_to_firestore

from models.xrpl_models import PaymentRequest


client_class = XRPLClient()
sdk_class = Xumm_SDK()
client = client_class.get_client()
sdk = sdk_class.get_xumm_sdk()


async def handle_payment_request(payment_request: PaymentRequest):
    """Handle payment request"""
    if payment_request.user_token is None:
        return await send_payment_request_no_user_token(payment_request)
    else:
        return await send_payment_request(payment_request)

async def handle_xchain_payment_request(payment_request: PaymentRequest):
    """Handle payment request"""
    return await send_xchain_payment_request(payment_request)

async def send_payment_request(payment_request: PaymentRequest):
    """Send payment request"""
    url = ""
    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": payment_request.type,
            "Account": payment_request.source,
            "Destination": payment_request.destination,
            "Amount": str(xrp_to_drops(payment_request.amount)),
        },
        "Fee": "12",
        "options": {"expire": 3},
        "user_token": payment_request.user_token,
        "custom_meta": {
            "blob": {"task_id": payment_request.task_id, "function": "payment_request"}
        },
    }

    # Create the payment request with the XUMM SDK
    try:
        subscription = sdk.payload.create(xumm_payload)
        write_response_to_firestore(
            subscription.to_dict(), "payment_request", payment_request.task_id
        )
        response = json.dumps(subscription.to_dict(), indent=4, sort_keys=True)
        # url = '{}'.format(subscription.next.always)
        return response
    except Exception as e:
        print(f"Error creating subscription: {e}")
        # Handle the error as appropriate
        return f"Error creating subscription: {e}"

async def send_xchain_payment_request(payment_request: PaymentRequest):
    """Send payment request"""
    url = ""
    # Create the XUMM payment request payload
    xumm_payload = {
            "TransactionType": "XChainAccountCreateCommit",
    "Account": wallet_lockingchain.address,
    "Destination": wallet_issuingchain.address,
    "XChainBridge": xchainbridge,
    "SignatureReward": "100",
    "Amount": "5000000000"
    }

    # Create the payment request with the XUMM SDK
    try:
        subscription = sdk.payload.create(xumm_payload)
        write_response_to_firestore(
            subscription.to_dict(), "payment_request", payment_request.task_id
        )
        response = json.dumps(subscription.to_dict(), indent=4, sort_keys=True)
        # url = '{}'.format(subscription.next.always)
        return response
    except Exception as e:
        print(f"Error creating subscription: {e}")
        # Handle the error as appropriate
        return f"Error creating subscription: {e}"


async def send_payment_request_no_user_token(payment_request: PaymentRequest):
    """Create the XUMM payment request payload"""
    xumm_payload = {
        "txjson": {
            "TransactionType": payment_request.type,
            "Account": payment_request.source,
            "Destination": payment_request.destination,
            "Amount": str(xrp_to_drops(payment_request.amount)),
        },
        "Fee": "12",
        "options": {"expire": 3},
        "custom_meta": {
            "blob": {"task_id": payment_request.task_id, "function": "payment_request"}
        },
    }

    def callback_func(event):
        print("Callback got here")
        try:
            event_status = f"New payload event: {event['data']}"
            print(event_status)
            if "expired" in event["data"] or "signed" in event["data"]:
                # payload is reolved return the data
                return event["data"]
        except Exception as e:
            print(f"Error in callback_func: {e}")

    try:
        # Create the payment request with the XUMM SDK
        create_payload = sdk.payload.create(xumm_payload)
        response = json.dumps(create_payload.to_dict(), indent=4, sort_keys=True)

    except Exception as e:
        return f"Error: {e}"

        # start the websocket subscription on this payload and listen for changes
    try:
        subscription = await sdk.payload.subscribe(create_payload.uuid, callback_func)
        write_response_to_firestore(
            subscription.to_dict(), "payment_request", payment_request.task_id
        )
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
