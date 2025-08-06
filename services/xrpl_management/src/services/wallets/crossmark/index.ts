import sdk from "@crossmarkio/sdk";
import { Payment } from "xrpl";

const crossmark = sdk;

export const signIn = async (): Promise<string> => {
  const response = await crossmark.methods.signInAndWait();
  if (response.response.data.address) {
    return response.response.data.address;
  }
  throw new Error("Failed to sign in with Crossmark.");
};

export const signAndSubmitTransaction = async (tx: Payment): Promise<string> => {
  const response = await crossmark.async.signAndSubmitAndWait({
    TransactionType: tx.TransactionType,
    Account: tx.Account,
    Destination: tx.Destination,
    Amount: tx.Amount,
  });
  if (response.response.data.resp) {
    return response.response.data.resp.toString();
  }
  throw new Error("Failed to sign transaction with Crossmark.");
};


