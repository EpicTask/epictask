import asyncio
import json
import datetime
import os
from fastapi import HTTPException

from starlette.responses import JSONResponse
from xrpl.asyncio.account import (does_account_exist, get_account_info,
                                  get_balance)
from xrpl.asyncio.transaction import ledger
from xrpl.models.requests import AccountObjects
from xrpl.models.requests.account_tx import AccountTx
from xrpl.clients import JsonRpcClient

from config.client import XRPLClient, Xumm_SDK
from firebase.firestore_db import write_response_to_firestore



client_class = XRPLClient()
sdk_class = Xumm_SDK()
client = client_class.get_client()
client_mainnet = JsonRpcClient(url="http://s1.ripple.com:51234/")
websocket_client = client_class.client_websocket
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
        response = websocket_client.request(request)
        objects = response.result["account_objects"]

        for obj in objects:
            escrows.append(obj)

        marker = response.result.get("marker")
        if marker is None:
            break

    return escrows

def get_transactions(wallet_address, limit: int = 25):
    transactions = []
    marker = None

    try:
        
        # Create a transaction history request
        transaction_history_request = AccountTx(
            account=wallet_address,
            limit=limit,  # Number of transactions to retrieve
            marker=marker
        )
        # Send the request and wait for the response
        response = client_mainnet.request(transaction_history_request)
        print(response.result)
        
        # Iterate through the response and extract transactions
        for result in response.result.get("transactions", []):
            transactions.append(result.get("tx"))

        # # Get the marker for the next page of transactions
        # marker = response.result.get("marker")

        # # If there are no more markers, exit the loop
        # if marker is None:
        #     break
        print(transactions)
        return transactions
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch transactions: {str(e)}",
        )

    