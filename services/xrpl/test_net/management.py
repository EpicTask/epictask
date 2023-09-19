from google_secrets import get_secret
import xumm
from xrpl.clients import JsonRpcClient, WebsocketClient

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s.altnet.rippletest.net:51234/")
clientWebsocket = WebsocketClient("wss://s.altnet.rippletest.net:51233")

# xrpscan api url
xrpscan_url = "https://api.xrpscan.com/api/v1"