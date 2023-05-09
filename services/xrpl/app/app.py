# app.py that uses FastAPI framework instead of FLASK
import asyncio
import os
import uvicorn
import xumm
from accounts_xrpl import (does_account_exist_sync, get_account_balance,
                           get_account_info_sync, get_fee_sync, lookup_escrow,
                           get_transaction_sync)
from escrow_xrpl import generate_xrpl_timestamp
from fastapi import FastAPI, Request
from google_secrets import get_secret
from payments_xrpl import initiate_payment, send_payment_request
from starlette.responses import JSONResponse
from subscription_xrpl import account_subscription_sync
from xrpl.clients import JsonRpcClient, WebsocketClient

app = FastAPI()

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")


@app.get('/')
def hello():
    """Return a friendly HTTP greeting."""
    message = "It's running!"

    """Get Cloud Run environment variables."""
    service = os.environ.get('K_SERVICE', 'Unknown service')
    revision = os.environ.get('K_REVISION', 'Unknown revision')

    return {"message": message, "Service": service, "Revision": revision}


@app.get('/balance/{address}')
def balance(address: str):
    try:
        balance = get_account_balance(address)
        return JSONResponse({"address": address, "balance": balance})
    except Exception as e:
        return JSONResponse({"error": str(e)})
#    http://0.0.0.0:8080/balance/rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF

# Call the 'get_account_info_sync' function with the given address and store
# the result in a variable called 'account_info'
@app.get('/account_info/{address}')
def account_info(address: str):
    try:
        account_info = get_account_info_sync(address)
        return JSONResponse(account_info.result)
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Checks whether an account exists with the specified address parameter.
@app.get('/account_exists/{address}')
def account_exists(address: str):
    try:
        exists = does_account_exist_sync(address)
        return JSONResponse({"address": address, "exists": exists})
    except Exception as e:
        return JSONResponse({"error": str(e)})


@app.get('/payment_request/{amount}/{source}/{destination}/{note}')
def process_payment(amount: int, source: str, destination: str, note: str):
    return initiate_payment(amount, source, destination, note)


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
def transaction_fee():
    try:
        fee = get_fee_sync()
        return JSONResponse({"transaction_fee": fee})
    except Exception as e:
        return JSONResponse({"error": str(e)})


@app.get('/verify_transaction/{tx_hash}')
async def verify_transaction(tx_hash: str):
    if not tx_hash:
        return JSONResponse({"error": "Missing 'tx_hash' parameter."})

    try:
        tx = get_transaction_sync(tx_hash)
        return JSONResponse({"transaction_hash": tx_hash, "transaction": tx.result})
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
    # escrow_create = EscrowCreate(
    #     account="rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF",
    #     amount=amount,
    #     # destination=destination,
    #     destination = "rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF",
    #     finish_after=finish_after,
    # )
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
    return JSONResponse(payload.to_dict())

# Example
# http://localhost:8080/create_escrow/rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF/10000/1677649420
# curl -X POST http://localhost:5000/create_escrow_xumm \
#      -F destination=YOUR_DESTINATION_ADDRESS \
#      -F amount=1000000 \
#      -F finish_after=1677649420

# Lookup Escrow


@app.get('/lookup_escrow/{account}')
def lookup_escrow_sync(account: str):
    escrow_info = lookup_escrow(account)
    return escrow_info


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

    return JSONResponse(payload.to_dict())

# Finish Escrow


@app.get('/finish_escrow_xumm/{owner}')
async def finish_escrow_xumm(owner: str):
    if not owner:
        return JSONResponse({"error": "Missing 'owner' parameter."})

    wallet = "rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF"
    offer_sequence = int(1)
    # escrow_finish = EscrowFinish(
    #     account=wallet.classic_address,
    #     owner=owner,
    #     offer_sequence=offer_sequence,
    # )
    escrow_finish = {
        "txjson": {
            "TransactionType": "EscrowFinish",
            "Account": wallet,
            "Owner": owner,
            "OfferSequence": offer_sequence
        },
    }
    payload = sdk.payload.create(escrow_finish)

    return JSONResponse(payload.to_dict())
# http://localhost:8080/finish_escrow_xumm/rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF/1

@app.get('/subscribe')
async def subscribe(request: Request):
    accounts = request.query_params.getlist('accounts')

    if not accounts:
        return JSONResponse({"error": "Missing 'accounts' parameter."})

    try:
        result = account_subscription_sync("subscribe", accounts)
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)})
# http://localhost:8080/subscribe?accounts=rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF


@app.post('/unsubscribe')
async def unsubscribe(request: Request):
    accounts = request.query_params.getlist('accounts')

    if not accounts:
        return JSONResponse({"error": "Missing 'accounts' parameter."})

    try:
        result = account_subscription_sync("unsubscribe", accounts)
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)})

# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))