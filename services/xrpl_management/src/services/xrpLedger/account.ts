import { Connection } from "xrpl/dist/npm/client/connection";
import { XRPLClient } from "../../config/clients/xrpl.js";
import { AccountSubscribe } from "./typings/index.js";

export class AccountService {
  private xrplClient: XRPLClient;

  constructor() {
    this.xrplClient = new XRPLClient();
    this.xrplClient.connect(); // Connect to the XRPL network
  }

  getBalances = async (
    address: string
  ): Promise<Array<{
    value: string;
    currency: string;
    issuer?: string | undefined;
  }> | null> => {
    try {
      return await this.xrplClient.getClient().getBalances(address);
    } catch (error) {
      console.error("Error occurred while getting balances:", error);
      return null;
    }
  };

  getXrpBalance = async (address: string): Promise<number> => {
    try {
      console.log("Fetching XRP balance for address:", address);
      if (!address) {
        console.error("Address is required to fetch XRP balance.");
        return 0;
      }
      // Ensure the client is connected before making the request
      if (this.xrplClient.getClient().isConnected()) {
        console.error("XRPL client is connected.");

        return await this.xrplClient.getClient().getXrpBalance(address);
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
    const accountSubscribe = new AccountSubscribe(accounts);
    this.xrplClient.getClient().request(accountSubscribe);
  };

  getNetworkID = (): number | undefined => {
    return this.xrplClient.getClient().networkID;
  };

  getConnectionStatus = (): Connection => {
    return this.xrplClient.getClient().connection;
  };
}

export const accountService = new AccountService();
// let newSubscription = accountService.subscribeToAccount(["rwNn3ptJBkLuqoNrTEAgJ5Y2ZVqaXb1ccV"]);
// console.log(newSubscription);
// console.log('Done');
