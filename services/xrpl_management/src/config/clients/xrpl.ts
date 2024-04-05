import { Client } from 'xrpl';

export class XRPLClient {
  private client: Client;

  constructor() {
    this.client = new Client(process.env.WEBSOCKETCLIENT,
    );
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Error connecting to XRPL WebSocket:', error);
      console.log('Connecting to XRPL RPC');
      this.client = new Client(process.env.JSONRPCCLIENT || '',
      );
      await this.client.connect();
    }
  }

  getClient(): Client {
    return this.client;
  }
}
