import asyncio
import os

import xumm
from google_secrets import get_secret
from starlette.responses import JSONResponse
from xrpl.asyncio.account import (does_account_exist, get_account_info,
                                  get_balance)
from xrpl.asyncio.ledger import get_fee
from xrpl.asyncio.transaction import ledger
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl.models.requests import AccountObjects

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")

# Define a function that retrieves and returns the balance for a given address


def get_account_balance(address: str) -> int:
    # Create a new event loop
    loop = asyncio.new_event_loop()
    # Set the event loop
    asyncio.set_event_loop(loop)
    # Retrieve the balance using the previous function, while passing the event loop
    balance = loop.run_until_complete(
        get_balance(address=address, client=client))
        # Close the event loop
    loop.close()
    return balance


async def does_account_exist_async(address: str):

    # Return an awaitable call to the function 'does_account_exist'
    # passing the account address and the client object as arguments
    return await does_account_exist(address=address, client=client)


def does_account_exist_sync(address: str) -> bool:

    # Create a new event loop
    loop = asyncio.new_event_loop()

    # Set the created event loop as the current event loop
    asyncio.set_event_loop(loop)

    # Run the does_account_exist_async function asynchronously with the specified address
    # and store the result in a variable called 'exists'
    exists = loop.run_until_complete(does_account_exist_async(address))
    # Close the event loop
    loop.close()
    # Return the 'exists' variable containing the result from does_account_exist_async
    return exists

async def get_transaction_async(tx_hash: str):
    return await ledger.get_transaction_from_hash(tx_hash, client)


def get_transaction_sync(tx_hash: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    tx = loop.run_until_complete(get_transaction_async(tx_hash))
    return tx

# Define an asynchronous function that takes an address as parameter


async def get_account_info_async(address: str):

    # Return an awaitable call to the function 'get_account_info',
    # passing the account address and the client object as arguments
    return await get_account_info(address=address, client=client)
# Define a synchronous function that also takes an address as parameter


def get_account_info_sync(address: str):

    # Create a new event loop
    loop = asyncio.new_event_loop()

    # Set the created event loop as the current event loop
    asyncio.set_event_loop(loop)
    account_info = loop.run_until_complete(get_account_info_async(address))
    # Close the event loop
    loop.close()
    # Return the 'account_info' variable holding the result from get_account_info_async
    return account_info


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
