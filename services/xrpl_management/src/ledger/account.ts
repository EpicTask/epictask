import { xrplClient } from "../config/clients/xrpl.js";
import { AccountSubscribe } from "./typings/index.js";
import { 
    AccountInfoRequest, 
    AccountTxRequest, 
    TxRequest,
    AccountObjectsRequest,
    AccountInfoResponse,
    AccountObjectsResponse,
    AccountTxResponse,
    TxResponse,
    Connection
} from "xrpl";

export class AccountService {
  constructor() {
    if (!xrplClient) {
      throw new Error("XRPL client not initialized.");
    }
  }

  async getAccountInfo(address: string): Promise<AccountInfoResponse | null> {
    if (!xrplClient) {
      console.error("XRPL client is not initialized.");
      return null;
    }
    try {
      const request: AccountInfoRequest = {
        command: "account_info",
        account: address,
        ledger_index: "validated",
      };
      return await xrplClient.request(request);
    } catch (error) {
      console.error("Error getting account info:", error);
      return null;
    }
  }

  async accountExists(address: string) {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return false;
    }
    try {
      await this.getAccountInfo(address);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("actNotFound")) {
        return false;
      }
      throw error;
    }
  }

  async verifyTransaction(txHash: string): Promise<TxResponse | null> {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return null;
    }
    try {
      const request: TxRequest = {
        command: "tx",
        transaction: txHash,
        binary: false,
      };
      return await xrplClient.request(request);
    } catch (error) {
      console.error("Error verifying transaction:", error);
      return null;
    }
  }

  async getTransactions(address: string, limit?: number): Promise<AccountTxResponse | null> {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return null;
    }
    try {
      const request: AccountTxRequest = {
        command: "account_tx",
        account: address,
        limit: limit || 20,
      };
      return await xrplClient.request(request);
    } catch (error) {
      console.error("Error getting transactions:", error);
      return null;
    }
  }

  async lookupEscrow(account: string): Promise<AccountObjectsResponse | null> {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return null;
    }
    try {
      const request: AccountObjectsRequest = {
        command: 'account_objects',
        account: account,
        type: 'escrow',
        ledger_index: 'validated'
      };
      return await xrplClient.request(request);
    } catch (error) {
        console.error('Error looking up escrow:', error);
        return null;
    }
  }

  generateXrplTimestamp(timestamp?: number): number {
    const rippleEpochOffset = 946684800;
    if (timestamp) {
        return timestamp - rippleEpochOffset;
    }
    const now = Math.floor(Date.now() / 1000);
    return now - rippleEpochOffset;
  }

  getBalances = async (
    address: string
  ): Promise<Array<{
    value: string;
    currency: string;
    issuer?: string | undefined;
  }> | null> => {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return null;
    }
    try {
      return await xrplClient.getBalances(address);
    } catch (error) {
      console.error("Error occurred while getting balances:", error);
      return null;
    }
  };

  getXrpBalance = async (address: string): Promise<number> => {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return 0;
    }
    try {
      if (!address) {
        console.error("Address is required to fetch XRP balance.");
        return 0;
      }
      if (xrplClient.isConnected()) {
        return await xrplClient.getXrpBalance(address);
      } else {
        console.error(
          "XRPL client is not connected. Please check the connection."
        );
        return 0;
      }
    } catch (error) {
      console.error("Error occurred while getting XRP balance:", error);
      return 0;
    }
  };

  subscribeToAccount = (accounts: string[]): void => {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return;
    }
    const accountSubscribe = new AccountSubscribe(accounts);
    xrplClient.request(accountSubscribe);
  };

  getNetworkID = (): number | undefined => {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return undefined;
    }
    return xrplClient.networkID;
  };

  getConnectionStatus = (): Connection | null => {
    if (!xrplClient) {
        console.error("XRPL client is not initialized.");
        return null;
    }
    return xrplClient.connection;
  };
}

export const accountService = new AccountService();
