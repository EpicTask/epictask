import asyncio
import json
import os

import xumm
from firestore_db import write_response_to_firestore
from google_secrets import get_secret
from starlette.responses import JSONResponse
from xrpl.asyncio.account import (does_account_exist, get_account_info,
                                  get_balance)
from xrpl.asyncio.transaction import ledger
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl.models.requests import AccountObjects

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")

# Connect wallet


async def connectWallet():
    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "SignIn"
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


# Define a function that retrieves and returns the balance for a given address
async def get_account_balance(address: str) -> int:
    balance = await get_balance(address=address, client=client)
    return balance


async def does_account_exist_async(address: str):
    return await does_account_exist(address=address, client=client)


async def get_transaction_async(tx_hash: str):
    return await ledger.get_transaction_from_hash(tx_hash, client)


# Retrieves account information for ledger, takes an address as parameter
async def get_account_info_async(address: str):
    return await get_account_info(address=address, client=client)
# Define a synchronous function that also takes an address as parameter


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
