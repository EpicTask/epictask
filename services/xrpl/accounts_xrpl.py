import asyncio
import json
import datetime
from services.xrpl.firebase.firestore_db import write_response_to_firestore
from starlette.responses import JSONResponse
from xrpl.asyncio.account import (does_account_exist, get_account_info,
                                  get_balance)
from xrpl.asyncio.transaction import ledger
from xrpl.models.requests import AccountObjects

from services.xrpl.config.client import XRPLClient,Xumm_SDK

client_class = XRPLClient()
sdk_class = Xumm_SDK()
client = client_class.get_client()
sdk = sdk_class.get_xumm_sdk()

# Connect wallet
async def connectWallet(uid: str):
    current_date = datetime.datetime.now().isoformat()
    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "SignIn"
        },
        "custom_meta": {
                "blob": {
                    "uid": uid,
                    "function":"connectWallet"
                }
            }
    }

    # Create the payment request with the XUMM SDK

    try:
        subscription = sdk.payload.create(xumm_payload)
        write_response_to_firestore(subscription.to_dict(), "signin_request")
        response = json.dumps(subscription.to_dict(), indent=4, sort_keys=True)
        url = '{}'.format(subscription.next.always)
        return url
    except Exception as e:
        print(f"Error creating subscription: {e}")
        # Handle the error as appropriate
        return f"Error creating subscription: {e}"


# Retrieves and returns the balance for a given address
async def get_account_balance(address: str) -> int:
    balance = await get_balance(address=address, client=client)
    return balance


async def does_account_exist_async(address: str):
    return await does_account_exist(address=address, client=client)


async def get_transaction_async(tx_hash: str):
    return await ledger.get_transaction_from_hash(tx_hash, client)


# Retrieves account information from ledger, takes address as parameter
async def get_account_info_async(address: str):
    return await get_account_info(address=address, client=client)


def lookup_escrow(account: str):
    if not account:
        return JSONResponse({"error": "Missing 'account' parameter."})
    escrows = []
    ledger_index = "validated"
    marker = None

    while True:
        request = AccountObjects(
            account=account,
            ledger_index=ledger_index,
            limit=10,
            marker=marker,
            type="escrow",
        )
        response = client.request(request)
        objects = response.result["account_objects"]

        for obj in objects:
            escrows.append(obj)

        marker = response.result.get("marker")
        if marker is None:
            break

    return escrows
