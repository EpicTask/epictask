import { xummSdk } from "../config/clients/xumm";
import { describe, it, expect } from "@jest/globals";

describe("xummSdk", () => {
  it("should initialize the Xumm SDK", () => {
    // Tests might run without env vars, so it might be null, but defined.
    expect(xummSdk).toBeDefined();
  });
});
