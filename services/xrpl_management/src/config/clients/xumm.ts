import { Xumm } from "xumm";
import getSecret from "../secrets";

const initializeSdk = async () => {
  try {
    const apiKey = await getSecret("xumm-key") || "";
    const apiSecret = await getSecret("xumm-secret") || "";
    if (!apiKey || !apiSecret) {
      throw new Error("Xumm API key or secret not found.");
    }
    return new Xumm(apiKey, apiSecret);
  } catch (e) {
    console.error(`Failed to initialize Xumm SDK: ${e}`);
    return null;
  }
};

export const xummSdk = await initializeSdk();
