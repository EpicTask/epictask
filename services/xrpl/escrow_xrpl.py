import asyncio
import datetime
import os
import time
from fastapi.responses import JSONResponse

import xumm
from firestore_db import write_response_to_firestore
from google_secrets import get_secret
from xrpl.asyncio.transaction import send_reliable_submission
# XRPL imports
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl.models.transactions import EscrowCreate
from xrpl.wallet import Wallet
from xrpl.utils import xrp_to_drops
from xrpl_models import CreateEscrowModel, EscrowModel

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


def generate_xrpl_timestamp(timestamp):
    if timestamp is None:
        newTimestamp = createTenMinTimestamp()
    newTimestamp = timestamp - 946684800
    return newTimestamp


def createTenMinTimestamp():
    current_time = datetime.datetime.now()
    ten_min_from_now = current_time + datetime.timedelta(minutes=10)
    newTimestamp = ten_min_from_now.timestamp() - 946684800

    return newTimestamp

# Check if the timestamp is in the future


def is_timestamp_after_current(timestamp):
    current_time = datetime.datetime.now()
    timestamp_datetime = datetime.datetime.fromtimestamp(timestamp)
    print(timestamp_datetime > current_time)
    return timestamp_datetime > current_time


def create_escrow_xumm(response: CreateEscrowModel):
    finish_after = generate_xrpl_timestamp(response.finish_after)
    print(finish_after)
    cancel_after = response.cancel_after
    if cancel_after is not None:
        cancel_after = generate_xrpl_timestamp(response.cancel_after)
    amount = str(xrp_to_drops(response.amount))
    try:
        escrow_tx = {
            "txjson": {
                "TransactionType": "EscrowCreate",
                "Account": response.account,
                "Destination": response.destination,
                "Amount": amount,
                "FinishAfter": finish_after,
                # "CancelAfter": cancel_after,
            },
            "user_token": response.user_token,
            "custom_meta": {
                "blob": {
                    "task_id": response.task_id,
                    "uid": response.user_id
                }
            }
        }
        print(escrow_tx)
        payload = sdk.payload.create(escrow_tx)
        write_response_to_firestore(payload.to_dict(), "create_escrow")
        return JSONResponse({"status": "Escrow successfully created."})
    except Exception as e:
        # Handle the errore appropriately
        return JSONResponse({"error": str(e)})

# Finish Escrow

def finish_escrow_xumm(response: EscrowModel):
    try:
        escrow_finish = {
            "txjson": {
                "TransactionType": "EscrowFinish",
                "Account": response.account,
                "Owner": response.owner,
                "OfferSequence": response.offer_sequence
            },
            "user_token": response.user_token,
            "custom_meta": {
                "blob": {
                    "task_id": response.task_id,
                    "uid": response.user_id
                }
            }
        }
        payload = sdk.payload.create(escrow_finish)
        write_response_to_firestore(payload.to_dict(), "finish_escrow_xumm")
        return JSONResponse(payload.to_dict())
    except Exception as e:
        # Handle the errore appropriately
        return JSONResponse({"error": str(e)})

# Cancel Escrow

def cancel_escrow_xumm(response: EscrowModel):
    try:
        escrow_tx = {
            "txjson": {
                "TransactionType": "EscrowCancel",
                "Account": response.account,
                "Owner": response.owner,
                "OfferSequence": response.offer_sequence
            },
            "user_token": response.user_token,
            "custom_meta": {
                "blob": {
                    "task_id": response.task_id,
                    "uid": response.user_id
                }
            }
        }
        payload = sdk.payload.create(escrow_tx)
        write_response_to_firestore(payload.to_dict(), "cancel_escrow_xumm")
        return JSONResponse(payload.to_dict())
    except Exception as e:
        # Handle the errore appropriately
        return JSONResponse({"error": str(e)})
