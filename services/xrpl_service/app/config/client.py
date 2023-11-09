import os
import xumm
from .google_secrets import get_secret
from xrpl.clients import JsonRpcClient, WebsocketClient


class XRPLClient:
    """XRPL Client"""
    def __init__(self):
        self.client_address = JsonRpcClient(os.getenv('JSONRPCCLIENT'))
        self.client_websocket = WebsocketClient(os.getenv('WEBSOCKETCLIENT'))


    def get_client(self):
        """Get client"""
        return self.client_address
    
    def get_clientWebsocket(self):
        """Get client websocket"""
        return self.client_websocket

class Xumm_SDK:
    """XUMM SDK"""
    def __init__(self):
        self.api_key = get_secret('xumm-key')
        self.api_secret = get_secret('xumm-secret')

    def get_xumm_sdk(self):
        """Get XUMM SDK"""
        try:
            sdk = xumm.XummSdk(self.api_key, self.api_secret)
            return sdk
        except Exception as e:
            print(f"Failed to initialize Xumm SDK: {str(e)}")
            return None
