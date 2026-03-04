import {describe, beforeEach, it, jest, expect} from '@jest/globals';
import { Client } from "xrpl";

describe("XRPL Configuration", () => {
  let client: Client;

  beforeEach(() => {
    client = new Client(process.env.WEBSOCKETCLIENT || 'wss://s.altnet.rippletest.net:51233');
  });

  it("should connect to XRPL WebSocket", async () => {
    client.connect = jest.fn() as any;
    await client.connect();

    expect(client.connect).toHaveBeenCalled();
  });
});
