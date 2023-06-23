# app.py that uses FastAPI framework instead of FLASK
import asyncio
import json
import os

import uvicorn
import xumm
from accounts_xrpl import (connectWallet, does_account_exist_async,
                           get_account_balance, get_account_info_async,
                           get_transaction_async, lookup_escrow)
from escrow_xrpl import generate_xrpl_timestamp
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from firestore_db import write_response_to_firestore
from google_secrets import get_secret
from payments_xrpl import handle_payment_request, send_payment_request
from starlette.responses import JSONResponse
from subscription_xrpl import account_subscription_sync
from websocket_handler import connection_manager
from xrpl.asyncio.ledger import get_fee
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl_models import PaymentRequest
from dotenv import load_dotenv
app = FastAPI()

load_dotenv()

baseUrl = os.getenv("BASEURL")
defaultUrl = os.getenv("DEFAULT_URL")
origins = [
    baseUrl,
    defaultUrl,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")


@app.get('/', response_class=HTMLResponse)
async def hello(request: Request):
    """Return a friendly HTTP greeting."""
    message = "It's running!"

    """Get Cloud Run environment variables."""
    service = os.environ.get('K_SERVICE', 'Unknown service')
    revision = os.environ.get('K_REVISION', 'Unknown revision')

    return templates.TemplateResponse("index.html", {"request": request, "message": message, "Service": service, "Revision": revision})

# XUMM sign in request


@app.get('/xummSignInRequest/{uid}')
async def signInRequest(uid: str):
    return await connectWallet(uid)

# Get account balance


@app.get('/balance/{address}')
async def balance(address: str):
    try:
        balance = await get_account_balance(address)
        response = {"address": address, "balance": balance}
        doc_id = write_response_to_firestore(response, "balance")
        return JSONResponse({"doc_id": doc_id, "response": response})
    except Exception as e:
        return JSONResponse({"error": str(e)})

# Get account information


@app.get('/account_info/{address}')
def account_info(address: str):
    try:
        account_info = get_account_info_async(address)
        write_response_to_firestore(account_info.result, "account_info")
        return JSONResponse(account_info.result)
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Checks whether an account exists with the specified address parameter.
@app.get('/account_exists/{address}')
async def account_exists(address: str):
    try:
        exists = await does_account_exist_async(address)
        response = {"address": address, "exists": exists}
        write_response_to_firestore(response, "account_exists")
        return JSONResponse(response)
    except Exception as e:
        return JSONResponse({"error": str(e)})

# Payment test


@app.get('/paymentTest')
async def test_payment(request: Request):
    try:
        asyncio.set_event_loop(asyncio.SelectorEventLoop())
        url = asyncio.get_event_loop().run_until_complete(send_payment_request(100000,
                                                                               'rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF', 'rpaxHGQVgQSXF1HaKGRpLKm6X7eh26v6eV', 'test payment request'))
        data = {'url': url}
    except RuntimeError as e:
        print(f"Error occurred: {e}")
        data = {'url': f"Error occurred: {e}"}
        return JSONResponse(data)

    return JSONResponse(data)


# Returns the transaction fee as a JSON object
@app.get('/transaction_fee')
async def transaction_fee():
    try:
        fee = await get_fee(client)
        response = {"transaction_fee": fee}
        doc_id = write_response_to_firestore(response, "transaction_fee")
        return JSONResponse({"doc_id": doc_id, "response": response})
    except Exception as e:
        return JSONResponse({"error": str(e)})

# Verify a transaction


@app.get('/verify_transaction/{tx_hash}')
async def verify_transaction(tx_hash: str):
    if not tx_hash:
        return JSONResponse({"error": "Missing 'tx_hash' parameter."})

    try:
        tx = await get_transaction_async(tx_hash)
        response = {"transaction_hash": tx_hash, "transaction": tx.result}
        doc_id = write_response_to_firestore(response, "verify_transaction")
        return JSONResponse({"doc_id": doc_id, "response": response})
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Create an Escrow
@app.get('/create_escrow/{destination}/{amount}/{finish_after}')
async def create_escrow(destination: str, amount: int, finish_after: str):
    if not all([destination, amount, finish_after]):
        return JSONResponse({"error": "Missing required parameters."})

    fiveMinute = generate_xrpl_timestamp('5min')
    tenMinute = generate_xrpl_timestamp('10min')
    # finish_after = int(finish_after)
    finish_after = fiveMinute
    amount = int(amount)
    escrow_create = {
        "txjson": {
            "TransactionType": "EscrowCreate",
            "Account": "rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF",
            "Destination": destination,
            "Amount": str(amount),
            "FinishAfter": finish_after,
            "CancelAfter": tenMinute
        },
    }
    payload = sdk.payload.create(escrow_create)
    write_response_to_firestore(payload.to_dict(), "create_escrow")
    return JSONResponse(payload.to_dict())


# Lookup Escrow
@app.get('/lookup_escrow/{account}')
def lookup_escrow_sync(account: str):
    escrow_info = lookup_escrow(account)
    write_response_to_firestore(escrow_info, "lookup_escrow")
    return escrow_info

# Cancel Escrow


@app.get('/cancel_escrow_xumm/{owner}')
async def cancel_escrow_xumm(owner: str):
    if not owner:
        return JSONResponse({"error": "Missing 'owner' parameter."})

    wallet = "rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF"
    offer_sequence = int(37541655)
    escrow_cancel = {
        "txjson": {
            "TransactionType": "EscrowCancel",
            "Account": wallet,
            "Owner": owner,
            "OfferSequence": offer_sequence
        },
    }
    payload = sdk.payload.create(escrow_cancel)
    write_response_to_firestore(payload.to_dict(), "cancel_escrow_xumm")
    return JSONResponse(payload.to_dict())

# Finish Escrow


@app.get('/finish_escrow_xumm/{owner}')
async def finish_escrow_xumm(owner: str):
    if not owner:
        return JSONResponse({"error": "Missing 'owner' parameter."})

    wallet = "rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF"
    offer_sequence = int(1)
    escrow_finish = {
        "txjson": {
            "TransactionType": "EscrowFinish",
            "Account": wallet,
            "Owner": owner,
            "OfferSequence": offer_sequence
        },
    }
    payload = sdk.payload.create(escrow_finish)
    write_response_to_firestore(payload.to_dict(), "finish_escrow_xumm")
    return JSONResponse(payload.to_dict())


@app.get('/subscribe')
async def subscribe(request: Request):
    accounts = request.query_params.getlist('accounts')

    if not accounts:
        return JSONResponse({"error": "Missing 'accounts' parameter."})

    try:
        result = await account_subscription_sync("subscribe", accounts)
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)})


@app.post('/unsubscribe')
async def unsubscribe(request: Request):
    accounts = request.query_params.getlist('accounts')

    if not accounts:
        return JSONResponse({"error": "Missing 'accounts' parameter."})

    try:
        result = await account_subscription_sync("unsubscribe", accounts)
        return result
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Make a payment request
@app.post('/payment_request/')
async def process_payment(payment_request: PaymentRequest):
    response = await handle_payment_request(payment_request)
    return response


# Websocket Logic
async def handle_websocket_message(websocket: WebSocket, message: str):
    data = json.loads(message)
    payment_request = PaymentRequest(**data)
    if payment_request.type == "payment_request":
        await handle_payment_request(payment_request)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        while True:
            message = await websocket.receive_text()
            await handle_websocket_message(websocket, message)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)

# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
