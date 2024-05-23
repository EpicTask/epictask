import { XummSDK } from "../config/clients/xumm";
import { describe, beforeEach, test, it, jest, expect } from "@jest/globals";

describe("XummSDK", () => {
  let xummSDK: XummSDK;

  beforeEach(() => {
    xummSDK = new XummSDK();
  });

  it("should initialize the Xumm SDK", () => {
    expect(xummSDK.sdk).toBeDefined();
  });
});
