import { describe, beforeEach, test, it, jest, expect } from "@jest/globals";
import { AccountService } from "../ledger/account";
import { XRPLClient } from "../config/clients";

describe("AccountService", () => {
  let accountService: AccountService;
  let mockXRPLClient: jest.Mocked<XRPLClient>;

  beforeEach(() => {
    mockXRPLClient = new XRPLClient() as jest.Mocked<XRPLClient>;
    accountService = new AccountService();
  });

  test("should get balances", async () => {
    const mockAccount = "mockAccount";
    const mockBalance = {
      value: "1000",
      currency: "XRP",
    }[0];
    jest
      .fn(mockXRPLClient.getClient().getBalances)
      .mockResolvedValue(mockBalance);

    const result = await accountService.getBalances(mockAccount);

    expect(result).toBe(mockBalance);
    expect(mockXRPLClient.getClient().getBalances).toHaveBeenCalledWith(
      mockAccount
    );
  });

  it("should get XRP balance", async () => {
    const mockAccount = "mockAccount";
    const mockXrpBalance = 500;
    jest
      .fn(mockXRPLClient.getClient().getXrpBalance)
      .mockResolvedValue(mockXrpBalance);

    const result = await accountService.getXrpBalance(mockAccount);

    expect(result).toBe(mockXrpBalance);
    expect(mockXRPLClient.getClient().getXrpBalance).toHaveBeenCalledWith(
      mockAccount
    );
  });

  it("should subscribe to account", () => {
    const mockAccounts = ["mockAccount1", "mockAccount2"];
    accountService.subscribeToAccount(mockAccounts);

    expect(mockXRPLClient.getClient().request).toHaveBeenCalled();
  });
});
