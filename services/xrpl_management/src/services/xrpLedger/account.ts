import { Connection } from "xrpl/dist/npm/client/connection";
import { XRPLClient } from "../../config/clients/xrpl";
import { AccountSubscribe } from "./typings";

export class AccountService {
  private xrplClient: XRPLClient;

  constructor() {
    this.xrplClient = new XRPLClient();
    this.xrplClient.connect(); // Connect to the XRPL network
  }

  getBalances = async (account: string): Promise<any> => {
    try {
      return await this.xrplClient.getClient().getBalances(account);
    } catch (error) {
      console.error("Error occurred while getting balances:", error);
      return null;
    }
  };

  getXrpBalance = async (account: string): Promise<any> => {
    try {
      return await this.xrplClient.getClient().getXrpBalance(account);
    } catch (error) {
      console.error("Error occurred while getting XRP balance:", error);
      return null;
    }
  };

  subscribeToAccount = (accounts: string[]): void => {
    const accountSubscribe = new AccountSubscribe(accounts);
    this.xrplClient.getClient().request(accountSubscribe);
  };

  getNetworkID = (account: string): number => {
    return this.xrplClient.getClient().networkID;
  };

  getConnectionStatus = (account: string): Connection => {
    return this.xrplClient.getClient().connection;
  };
}

const accountService = new AccountService();
let newSubscription = accountService.subscribeToAccount(["rwNn3ptJBkLuqoNrTEAgJ5Y2ZVqaXb1ccV"]);
console.log(newSubscription);
console.log('Done');