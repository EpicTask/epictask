import {describe, beforeEach, it, jest, expect} from '@jest/globals';
import { Client } from "xrpl";

describe("XRPL Configuration", () => {
  let client: Client;

  beforeEach(() => {
    client = new Client(process.env.WEBSOCKETCLIENT);
  });

  it("should connect to XRPL WebSocket", async () => {
    await client.connect();

    expect(client.connect).toHaveBeenCalled;
  });

  it("should handle error and connect to XRPL RPC", async () => {
    const error = new Error("Connection error");
    jest.fn(client.connect).mockRejectedValueOnce(error);

    console.error = jest.fn();
    console.log = jest.fn();

    await client.connect();

    expect(console.error).toHaveBeenCalledWith(
      "Error connecting to XRPL WebSocket:",
      error
    );
    expect(console.log).toHaveBeenCalledWith("Connecting to XRPL RPC");
    expect(client.connect).toBeCalledTimes(2);
  });
});
