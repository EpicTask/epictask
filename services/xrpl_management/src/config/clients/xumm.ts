import { Xumm } from "xumm";
import getSecret from "../secrets";

export class XummSDK {
  private api_key: string;
  private api_secret: string;
  sdk: Xumm | null;

  constructor() {
    this.getSecrets;
    this.sdk = this.initializeSdk();
  }

  private getSecrets = async () => {
    this.api_key = await getSecret("xumm-key") || "";
    this.api_secret = await getSecret("xumm-secret") || "";
  };
  private initializeSdk(): Xumm | null {
    try {
      const apiKey =  this.api_key;
      const apiSecret =  this.api_secret;
      const sdk = new Xumm(apiKey, apiSecret);
      return sdk;
    } catch (e) {
      console.error(`Failed to initialize Xumm SDK: ${e}`);
      return null;
    }
  }
}
