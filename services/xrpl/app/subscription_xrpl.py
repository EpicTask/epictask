import asyncio
from xrpl.clients import WebsocketClient
from xrpl.models.requests import Subscribe, Unsubscribe


clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")

# Subscribe functions to listen to status updates on one or more accounts


async def account_subscription_sync(command, accounts):
    if command == "subscribe":
        return await clientWebsocket.request(Subscribe(accounts=accounts))
    elif command == "unsubscribe":
        return await clientWebsocket.request(Unsubscribe(accounts=accounts))

