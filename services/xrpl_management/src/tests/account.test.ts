import { describe, it, expect } from "@jest/globals";
import { accountService } from "../ledger/account";

describe("AccountService", () => {
  it("should be defined", () => {
    expect(accountService).toBeDefined();
  });
});
