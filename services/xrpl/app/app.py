"""
A sample Hello World server.
"""
import os
import xumm
import json
import asyncio
import websocket
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
# XRPL imports
from xrpl.clients import JsonRpcClient, WebsocketClient
from xrpl.asyncio.account import get_account_info, get_balance, does_account_exist
from xrpl.asyncio.transaction import ledger, send_reliable_submission
from xrpl.asyncio.ledger import get_fee
from xrpl.wallet import Wallet
from xrpl.models.transactions import EscrowCreate, EscrowCancel, EscrowFinish
from xrpl.models.requests import Subscribe, Unsubscribe


load_dotenv()
# pylint: disable=C0103
app = Flask(__name__)

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

# Define a route for retrieving balance for a given address
@app.route('/balance/<address>')
def balance(address: str):
    try:
        # Retrieve the balance for the given address
        balance = get_account_balance(address)
        # Return the balance in JSON format
        return jsonify({"address": address, "balance": balance})
    except Exception as e:
        # If there's an exception, return the error message
        return jsonify({"error": str(e)})
    
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
@app.route('/account_info/<address>')
def account_info(address: str):
    try:
        account_info = get_account_info_sync(address)

        # Return a JSON representation of the 'result' attribute of the 'account_info' object
        return jsonify(account_info.result)
    except Exception as e:

        # Return a JSON object with an 'error' key and a string value representing the encountered exception
        return jsonify({"error": str(e)})

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
@app.route('/account_exists/<address>')
def account_exists(address: str):
    try:
        exists = does_account_exist_sync(address)
        return jsonify({"address": address, "exists": exists})
    except Exception as e:
        return jsonify({"error": str(e)})
        
@app.route('/')
def hello():
    """Return a friendly HTTP greeting."""
    message = "It's running!"

    """Get Cloud Run environment variables."""
    service = os.environ.get('K_SERVICE', 'Unknown service')
    revision = os.environ.get('K_REVISION', 'Unknown revision')

    return render_template('index.html',
                           message=message,
                           Service=service,
                           Revision=revision)

# Send payment request
@app.route('/payment_request/<int:amount>/<string:source>/<string:destination>/<string:note>', methods=['GET', 'POST'])
def process_payment(amount, source, destination, note):
    return initiate_payment(amount, source, destination, note)
# http://localhost:8080/payment_request/500/rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF/rpaxHGQVgQSXF1HaKGRpLKm6X7eh26v6eV/Grocery%20shopping
# Send a payment request to the specified source and destination with the specified amount and note. 
def initiate_payment(amount, source, destination, note):
    try:
        asyncio.set_event_loop(asyncio.SelectorEventLoop())
        url = asyncio.get_event_loop().run_until_complete(
            send_payment_request(amount, source, destination, note))
        data = {'url': url}
    except RuntimeError as e:
        print(f"Error occurred: {e}")
        data = {'url': f"Error occurred: {e}"}
        return render_template('payment.html', data=data)

    return render_template('payment.html', data=data)


@app.route('/paymentTest', methods=["Get", "POST"])
def test_payment():
    try:
        asyncio.set_event_loop(asyncio.SelectorEventLoop())
        url = asyncio.get_event_loop().run_until_complete(send_payment_request(100000,
                                                                               'rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF', 'rpaxHGQVgQSXF1HaKGRpLKm6X7eh26v6eV', 'test payment request'))
        data = {'url': url}
    except RuntimeError as e:
        print(f"Error occurred: {e}")
        data = {'url': f"Error occurred: {e}"}
        return render_template('payment.html', data=data)

    return render_template('payment.html', data=data)


@app.route('/paymentForm', methods=["Get", "POST"])
def paymentForm():
    return render_template('payment_form.html')

async def get_fee_async():
    return await get_fee(client)

def get_fee_sync() -> int:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    fee = loop.run_until_complete(get_fee_async())
    return fee

# Returns the transaction fee as a JSON object
@app.route('/transaction_fee')
def transaction_fee():
    try:
        fee = get_fee_sync()
        return jsonify({"transaction_fee": fee})
    except Exception as e:
        return jsonify({"error": str(e)})
    
async def get_transaction_async(tx_hash: str):
    return await ledger.get_transaction_from_hash(tx_hash, client)

def get_transaction_sync(tx_hash: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    tx = loop.run_until_complete(get_transaction_async(tx_hash))
    return tx

@app.route('/verify_transaction/<tx_hash>', methods=['GET'])
def verify_transaction(tx_hash: str):
    if not tx_hash:
        return jsonify({"error": "Missing 'tx_hash' parameter."})

    try:
        tx = get_transaction_sync(tx_hash)
        return jsonify({"transaction_hash": tx_hash, "transaction": tx.result})
    except Exception as e:
        return jsonify({"error": str(e)})
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

# Create an Escrow 
@app.route('/create_escrow/<int:amount>/<string:destination>/<string:finish_after>')
def create_escrow(amount, destination, finish_after):
    secret = request.args.get('wallet_secret')
    

    if not all([secret, destination, amount, finish_after]):
        return jsonify({"error": "Missing required parameters."})

    wallet = Wallet.from_seed(secret)
    finish_after = int(finish_after)
    amount = int(amount)

    try:
        result = submit_escrow_sync(wallet, destination, amount, finish_after)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})
# Example    
# curl -X POST http://localhost:5000/create_escrow \
#      -d wallet_secret=YOUR_WALLET_SECRET \
#      -d destination=YOUR_DESTINATION_ADDRESS \
#      -d amount=1000000 \
#      -d finish_after=1677649420

async def submit_transaction_async(transaction, wallet: Wallet):
    return await send_reliable_submission(transaction, wallet, client)

def submit_transaction_sync(transaction, wallet: Wallet):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(submit_transaction_async(transaction, wallet))
    return result

@app.route('/cancel_escrow', methods=['POST'])
def cancel_escrow():
    secret = request.form.get('wallet_secret')
    offer_sequence = request.form.get('offer_sequence')

    if not all([secret, offer_sequence]):
        return jsonify({"error": "Missing required parameters."})

    wallet = Wallet.from_seed(secret)
    offer_sequence = int(offer_sequence)

    try:
        escrow_cancel = EscrowCancel(
            account=wallet.classic_address,
            offer_sequence=offer_sequence,
        )
        result = submit_transaction_sync(escrow_cancel, wallet)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/finish_escrow', methods=['POST'])
def finish_escrow():
    secret = request.form.get('wallet_secret')
    owner = request.form.get('owner')
    offer_sequence = request.form.get('offer_sequence')

    if not all([secret, owner, offer_sequence]):
        return jsonify({"error": "Missing required parameters."})

    wallet = Wallet.from_seed(secret)
    offer_sequence = int(offer_sequence)

    try:
        escrow_finish = EscrowFinish(
            account=wallet.classic_address,
            owner=owner,
            offer_sequence=offer_sequence,
        )
        result = submit_transaction_sync(escrow_finish, wallet)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})      

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

@app.route('/subscribe', methods=['GET','POST'])
def subscribe():
    accounts = request.args.getlist('accounts')

    if not accounts:
        return jsonify({"error": "Missing 'accounts' parameter."})

    try:
        result = account_subscription_sync("subscribe", accounts)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})

#http://localhost:8080/subscribe?accounts=rB4iz44nvW2yGDBYTkspVfyR2NMsR3NtfF
@app.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    accounts = request.args.getlist('accounts')

    if not accounts:
        return jsonify({"error": "Missing 'accounts' parameter."})

    try:
        result = account_subscription_sync("unsubscribe", accounts)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    server_port = os.environ.get('PORT', '8080')
    app.run(debug=False, port=server_port, host='0.0.0.0')
