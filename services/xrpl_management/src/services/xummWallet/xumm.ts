import { XummSDK } from "../../config/clients";
import { XummPayload } from "./types";
import { writeResponseToDatabase } from "../../controllers/database";
import { XummFunctionType } from "./types";

export const connectWallet = async (uid: string) => {
  const xummSdk = new XummSDK();
  const payload: XummPayload = {
    custom_meta: {
      blob: {
        uid: uid,
        function: "connectWallet",
      },
    },
    txjson: {
      TransactionType: "SignIn",
    },
  };
  try {
    const response = await xummSdk.sdk.payload?.create(payload);
    writeResponseToDatabase(response, XummFunctionType.SIGNIN_REQUEST);

    console.log("XUMM response", response);
    return response.next.always;
  } catch (error) {
    console.error("XUMM error", error);
    return error;
  }
};
