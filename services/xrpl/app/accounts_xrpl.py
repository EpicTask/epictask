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
