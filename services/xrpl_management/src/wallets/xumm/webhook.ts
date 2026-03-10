import { writeResponseToDatabase } from "../../data/database";

export interface XummWebhookBody<T = object> {
  payloadUuidv4: string;
  signed: boolean;
  userToken: object | null;
  custom_meta: {
    blob: T;
    identifier: string;
  };
}

export const handleXummWebhook = async (webhookBody: XummWebhookBody) => {
  try {
    const docId = await writeResponseToDatabase(webhookBody, "xumm_webhook");
    console.log("Webhook data saved with ID: ", docId);
    return { status: "success", docId };
  } catch (error: any) {
    console.error("Error handling Xumm webhook:", error);
    return { status: "error", message: error.toString() };
  }
};
