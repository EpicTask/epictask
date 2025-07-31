import { db } from "../../../config/clients/firebase";
import { collection, addDoc } from "firebase/firestore";
import { config } from "../../../config/config.dev";

export interface XummWebhookBody<T = object> {
  payloadUuidv4: string;
  signed: boolean;
  userToken: object | null;
  custom_meta: {
    blob: T;
    identifier: string;
  }
}

export const handleXummWebhook = async (webhookBody: XummWebhookBody) => {
  try {
    const docRef = await addDoc(collection(db, `${config.xrplServiceCollection}_webhooks`), {
      received_at: new Date(),
      payload: webhookBody,
    });
    console.log("Webhook data saved with ID: ", docRef.id);
    return { status: "success", docId: docRef.id };
  } catch (error:any) {
    console.error("Error handling Xumm webhook:", error);
    return { status: "error", message: error.toString() };
  }
};