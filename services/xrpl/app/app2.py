# app.py that uses FastAPI framework instead of FLASK
import os
import time
import xumm
import json
import asyncio
from fastapi import FastAPI, Request
from starlette.responses import JSONResponse, HTMLResponse
from dotenv import load_dotenv
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl.asyncio.account import get_account_info, get_balance, does_account_exist
from xrpl.asyncio.transaction import ledger, send_reliable_submission
from xrpl.asyncio.ledger import get_fee
from xrpl.wallet import Wallet
from xrpl.models.transactions import EscrowCreate, EscrowCancel, EscrowFinish
from xrpl.models.requests import Subscribe, Unsubscribe, AccountObjects
from xrpl.utils import xrp_to_drops

load_dotenv()
app = FastAPI()

api_key = os.environ.get('API_KEY')
api_secret = os.environ.get('API_SECRET')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")

async def send_payment_request(amount, source, destination, payment_reference):
    url = ''
    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "Payment",
            "Account": source,
            "Destination": destination,
            "Amount": str(amount),
        },
        "Fee": "12",
        "options": {
            "expire": 3
        },
        "user_token": "f53f2b43-a000-47fc-bcd8-d4f5acf9d234"
    }

    # Create the payment request with the XUMM SDK

    try:
        subscription = sdk.payload.create(xumm_payload)
        print(json.dumps(subscription.to_dict(), indent=4, sort_keys=True))
        url = '{}'.format(subscription.next.always)
        return url
    except Exception as e:
        print(f"Error creating subscription: {e}")
        # Handle the error as appropriate
        return url


async def send_payment_request_no_user_token(amount, source, destination, payment_reference):

    # Create the XUMM payment request payload
    xumm_payload = {
        "txjson": {
            "TransactionType": "Payment",
            "Account": source,
            "Destination": destination,
            "Amount": str(amount),
        },
        "Fee": "12",
        "options": {
            "expire": 1
        },
        "user_token": "f53f2b43-a000-47fc-bcd8-d4f5acf9d234"
    }

    def callback_func(event):
        print('New payload event: {}'.format(event['data']))

        if 'signed' in event['data']:
            print('Signed')
            return event['data']

    # Create the payment request with the XUMM SDK
    sdk = xumm.XummSdk(api_key, api_secret)
    pong = sdk.ping()
    print(pong)
    subscription = await sdk.payload.create_and_subscribe(
        xumm_payload,
        callback_func,
    )

    # Print the payment request URL
    print(json.dumps(subscription.created.to_dict(), indent=4, sort_keys=True))
    print('New payload created, URL: {}'.format(
        subscription.created.next.always))
    print('  > Pushed: {}'.format('yes' if subscription.created.pushed else 'no'))

    """
    Wait until the subscription resolves (by returning something)
    in the callback function.
    """
    resolve_data = await subscription.resolved()
    print(resolve_data)
    try:
        if resolve_data['signed'] == False:
            print('The sign request was rejected.')

        else:
            print('The sign request was approved.')
            """
            Fetch the full payload end result, and get the issued
            user token, we can use to send our next payload per Push notification
            """
            result = sdk.payload.get(resolve_data['payload_uuidv4'])
            print('User token: {}'.format(result.application.issued_user_token))

    except:
        print('Error')

@app.get('/')
def hello():
    """Return a friendly HTTP greeting."""
    message = "It's running!"

    """Get Cloud Run environment variables."""
    service = os.environ.get('K_SERVICE', 'Unknown service')
    revision = os.environ.get('K_REVISION', 'Unknown revision')

    return {"message": message, "Service": service, "Revision": revision}

# Define a function that gets the account balance for a given address using asyncio
async def get_balance(address: str, client) -> int:
    balance = await client.get_balance(address=address)
    return balance

# Define a function that retrieves and returns the balance for a given address
def get_account_balance(address: str) -> int:
    # Create a new event loop
    loop = asyncio.new_event_loop()
    # Set the event loop
    asyncio.set_event_loop(loop)
    # Retrieve the balance using the previous function, while passing the event loop
    balance = loop.run_until_complete(get_balance(address=address, client=client))
    return balance


@app.get('/balance/{address}')
def balance(address: str):
    try:
        balance = get_account_balance(address)
        return JSONResponse({"address": address, "balance": balance})
    except Exception as e:
        return JSONResponse({"error": str(e)})

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
    
    # Run the get_account_info_async function asynchronously with the specified address
    # and store the result in a variable called 'account_info'
    account_info = loop.run_until_complete(get_account_info_async(address))
    
    # Return the 'account_info' variable holding the result from get_account_info_async
    return account_info

# Call the 'get_account_info_sync' function with the given address and store 
# the result in a variable called 'account_info'
@app.get('/account_info/{address}')
def account_info(address: str):
    try:
        account_info = get_account_info_sync(address)
        return JSONResponse(account_info.result)
    except Exception as e:
        return JSONResponse({"error": str(e)})

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

    # Return the 'exists' variable containing the result from does_account_exist_async
    return exists

# Checks whether an account exists with the specified address parameter.
@app.get('/account_exists/{address}')
def account_exists(address: str):
    try:
        exists = does_account_exist_sync(address)
        return JSONResponse({"address": address, "exists": exists})
    except Exception as e:
        return JSONResponse({"error": str(e)})

def initiate_payment(amount, source, destination, note):
    try:
        asyncio.set_event_loop(asyncio.SelectorEventLoop())
        url = asyncio.get_event_loop().run_until_complete(
            send_payment_request(amount, source, destination, note))
        data = {'url': url}
    except RuntimeError as e:
        print(f"Error occurred: {e}")
        data = {'url': f"Error occurred: {e}"}
        return JSONResponse(data)

    return JSONResponse(data)

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


async def get_fee_async():
    return await get_fee(client)

def get_fee_sync() -> int:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    fee = loop.run_until_complete(get_fee_async())
    return fee

# Returns the transaction fee as a JSON object
@app.get('/transaction_fee')
async def transaction_fee():
    try:
        fee = get_fee_sync()
        return JSONResponse({"transaction_fee": fee})
    except Exception as e:
        return JSONResponse({"error": str(e)})

async def get_transaction_async(tx_hash: str):
    return await ledger.get_transaction_from_hash(tx_hash, client)

def get_transaction_sync(tx_hash: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    tx = loop.run_until_complete(get_transaction_async(tx_hash))
    return tx

@app.get('/verify_transaction/{tx_hash}')
async def verify_transaction(tx_hash: str):
    if not tx_hash:
        return JSONResponse({"error": "Missing 'tx_hash' parameter."})

    try:
        tx = get_transaction_sync(tx_hash)
        return JSONResponse({"transaction_hash": tx_hash, "transaction": tx.result})
    except Exception as e:
        return JSONResponse({"error": str(e)})

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
    result = loop.run_until_complete(submit_escrow_async(wallet, destination, amount, finish_after))
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
            "FinishAfter":finish_after,
            "CancelAfter":tenMinute
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
async def lookup_escrow(account: str):
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

# Subscribe functions to listen to status updates on one or more accounts
async def account_subscription_async(command, accounts):
    if command == "subscribe":
        return await clientWebsocket.request(Subscribe(accounts=accounts))
    elif command == "unsubscribe":
        return await clientWebsocket.request(Unsubscribe(accounts=accounts))

async def account_subscription_sync(command, accounts):
    asyncio.set_event_loop(asyncio.SelectorEventLoop())
    result = asyncio.get_event_loop().run_until_complete(account_subscription_async(command, accounts))
    return result

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
#http://localhost:8080/subscribe?accounts=rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF

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

if __name__ == '__main__':
    server_port = os.environ.get('PORT', '8080')
    app.run(debug=False, port=server_port, host='0.0.0.0')
