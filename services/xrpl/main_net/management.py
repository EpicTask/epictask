from google_secrets import get_secret
import xumm
from xrpl.clients import JsonRpcClient

api_key = get_secret('xumm-key')
api_secret = get_secret('xumm-secret')
sdk = xumm.XummSdk(api_key, api_secret)

client = JsonRpcClient("https://s2.ripple.com:51234/")


# xrpscan api url
xrpscan_url = "https://api.xrpscan.com/api/v1"