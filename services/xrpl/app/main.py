# APP that uses FastAPI framework
import os

import uvicorn
from dotenv import load_dotenv
from account.accounts_xrpl import (connectWallet, does_account_exist_async,
                                   get_account_balance, get_account_info_async,
                                   get_transaction_async, get_transactions,
                                   lookup_escrow)

from wallets.xumm.escrow import (cancel_escrow_xumm, create_escrow_xumm,
                                finish_escrow_xumm, generate_xrpl_timestamp,
                                is_timestamp_after_current)
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from firebase.firestore_db import write_response_to_firestore
from gcs.storage import write_to_gcs
# TODO: Split mainnet and test new. Create Staging, Testing and Production Environments.
from misc.xrpscan_api import (xrpscan_get_accountBalance,
                              xrpscan_get_accountInfo,
                              )
from models.xrpl_models import CreateEscrowModel, EscrowModel, PaymentRequest
from wallets.xumm.payments import handle_payment_request
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

app = FastAPI()

load_dotenv()

baseUrl = os.environ.get("_BASEURL")
defaultUrl = os.environ.get("_DEFAULT_URL")
gatewayUrl = os.environ.get("_GATEWAY")
origins = [baseUrl, defaultUrl, gatewayUrl]

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")


# *** Primary Functions ***********************************

@app.get("/xchain_payment_request")
async def xchain_payment(request: Request):
    """Payment Request"""
    response = await handle_xchain_payment_request(payment_request)
    return response

# XUMM sign in request


@app.get("/xummSignInRequest/{uid}")
async def signInRequest(uid: str):
    """Sign in request"""
    return await connectWallet(uid)


# Make a payment request


@app.post("/payment_request")
async def process_payment(payment_request: PaymentRequest):
    """Payment Request"""
    response = await handle_payment_request(payment_request)
    return response


# Lookup Escrow


@app.get("/lookup_escrow/{account}")
def lookup_escrow_sync(account: str):
    """Look up escrow transactions"""
    escrow_info = lookup_escrow(account)
    return escrow_info


# Create an Escrow


@app.post("/create_escrow")
async def create_escrow(response: CreateEscrowModel):
    """Create escrow transaction"""
    if not response and is_timestamp_after_current(response.finish_after):
        return JSONResponse({"error": "Missing or invalid required parameters."})

    result = create_escrow_xumm(response)
    return result


# Cancel Escrow


@app.post("/cancel_escrow_xumm")
async def cancel_escrow(response: EscrowModel):
    """Cancel escrow"""
    if not response:
        return JSONResponse({"error": "Missing 'owner' parameter."})

    result = cancel_escrow_xumm(response)

    return result


# Finish Escrow


@app.post("/finish_escrow_xumm")
async def finish_escrow(response: EscrowModel):
    """Finish escrow"""
    if not response:
        return JSONResponse({"error": "Missing 'owner' parameter."})

    result = finish_escrow_xumm(response)
    return result


# *** Account Functions ********************************
# Get account balance


@app.get("/balance/{address}")
async def balance(address: str):
    """Retrieve account balance. Mainnet"""
    try:
        account_balance = xrpscan_get_accountBalance(address)
        response = {"address": address, "balance": account_balance}
        return JSONResponse(response)
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Get account information


@app.get("/account_info/{address}")
def account_info(address: str):
    try:
        get_account_info = xrpscan_get_accountInfo(address)
        return JSONResponse(get_account_info)
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Checks whether an account exists with the specified address parameter.
@app.get("/account_exists/{address}")
async def account_exists(address: str):
    """Check if account exists"""
    try:
        exists = await does_account_exist_async(address)
        response = {"address": address, "exists": exists}
        write_response_to_firestore(response, "account_exists")
        return JSONResponse(response)
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Get account balance using test net


@app.get("/test_net/balance/{address}")
async def balance_testnet(address: str):
    """Get account balance. Testnet"""
    try:
        account_balance = await get_account_balance(address)
        response = {"address": address, "balance": account_balance}
        doc_id = write_response_to_firestore(response, "balance")
        return JSONResponse({"doc_id": doc_id, "response": response})
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Get account information using test net


@app.get("/test_net/account_info/{address}")
def account_info_testnet(address: str):
    """Get account info. Testnet"""
    try:
        get_account_info_testnet = get_account_info_async(address)
        write_response_to_firestore(get_account_info_testnet.result, "account_info")
        return JSONResponse(account_info.result)
    except Exception as e:
        return JSONResponse({"error": str(e)})


# *** Transactions ********************************

# Verify a transaction
    
@app.get("/verify_transaction/{tx_hash}/{task_id}")
async def verify_transaction(tx_hash: str, task_id: str = None):
    """Verify transaction"""
    if not tx_hash:
        return JSONResponse({"error": "Missing 'tx_hash' parameter."})

    try:
        tx = await get_transaction_async(tx_hash)
        response = {"transaction_hash": tx_hash, "transaction": tx.result}
        doc_id = write_response_to_firestore(
            response, "verify_transaction", task_id=task_id
        )
        return JSONResponse({"doc_id": doc_id, "response": response})
    except Exception as e:
        return JSONResponse({"error": str(e)})


# Gets list of transactions by account.

@app.get("/transactions/{address}")
def account_exists_mainnet(address: str):
    """Check if account exists. Mainnet"""
    try:
        # Await the result of the asynchronous function
        transactions = get_transactions(address)
        return JSONResponse(content=transactions)
    except Exception as e:
        return JSONResponse({"error": str(e)})

# Record transaction history by account.

@app.get("/recordTransactions/{address}")
def account_exists_mainnet(address: str):
    """Check if account exists. Mainnet"""
    try:
        # Await the result of the asynchronous function
        transactions = get_transactions(address, 500)
        write_to_gcs(address, transactions)
        return JSONResponse(content=transactions)
    except Exception as e:
        return JSONResponse({"error": str(e)})



# Make a payment request


@app.get("/xrpl_timestamp")
async def generate_timestamp(timestamp: int):
    """Generate timestamp"""
    response = await generate_xrpl_timestamp(timestamp)
    return response


@app.get("/", response_class=HTMLResponse)
async def hello(request: Request):
    """Return a friendly HTTP greeting."""
    message = "It's running!"

    service = os.environ.get("K_SERVICE", "Unknown service")
    revision = os.environ.get("K_REVISION", "Unknown revision")
    print(baseUrl)
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "message": message,
            "Service": service,
            "Revision": revision,
        },
    )


# Execute the application when the script is run
if __name__ == "__main__":
    # Get the server port from the environment variable
    server_port = os.environ.get("PORT", "8080")

    # Run the FastAPI application
    uvicorn.run(app, host="0.0.0.0", port=int(server_port))
