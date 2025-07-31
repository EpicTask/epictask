import { Client } from 'xrpl';

const initializeClient = async () => {
  const client = new Client(process.env.XRPL_TESTNET_WSS || 'wss://s.altnet.rippletest.net:51233');
  try {
    await client.connect();
  } catch (error) {
    console.error('Error connecting to XRPL WebSocket:', error);
    // Fallback to JSON RPC client if WebSocket connection fails
    const jsonRpcClient = new Client(process.env.JSONRPCCLIENT || '');
    try {
      await jsonRpcClient.connect();
      return jsonRpcClient;
    } catch (rpcError) {
      console.error('Error connecting to XRPL JSON RPC:', rpcError);
      return null;
    }
  }
  return client;
};

export const xrplClient = await initializeClient();
