import asyncio
import os
import time

import xumm
from google_secrets import get_secret
from xrpl.asyncio.transaction import send_reliable_submission
# XRPL imports
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl.models.transactions import EscrowCreate
from xrpl.wallet import Wallet

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")


async def submit_escrow_async(wallet: Wallet, destination: str, amount: int, finish_after: int):
    escrow = EscrowCreate(
        account=wallet.classic_address,
        destination=destination,
        amount=str(amount),
        finish_after=finish_after,
    )
    return await send_reliable_submission(escrow, wallet, client)

# Submit escrow after creation
def submit_escrow_sync(wallet: Wallet, destination: str, amount: int, finish_after: int):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(submit_escrow_async(
        wallet, destination, amount, finish_after))
    return result


def generate_xrpl_timestamp(interval):
    if interval == '5min':
        delta = 5 * 60
    elif interval == '10min':
        delta = 10 * 60
    elif interval == '1hr':
        delta = 60 * 60
    elif interval == '24hr':
        delta = 24 * 60 * 60
    else:
        raise ValueError("Invalid interval specified")

    timestamp = int(time.time()) + delta - 946684800
    return timestamp
