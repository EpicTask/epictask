import { xummSdk } from "../../../config/clients";
import { XummPayload } from "./typings";
import { writeResponseToDatabase } from "../../../data/database";
import { XummFunctionType } from "./typings";

export const connectWallet = async (uid: string) => {
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
    if (!xummSdk) {
      throw new Error("Xumm SDK not initialized.");
    }
    const response = await xummSdk.payload?.create(payload);
    if (!response) {
      throw new Error("Failed to create XUMM payload.");
    }
    writeResponseToDatabase(response, XummFunctionType.SIGNIN_REQUEST);

    console.log("XUMM response", response);
    return response.next.always;
  } catch (error) {
    console.error("XUMM error", error);
    throw error;
  }
};
