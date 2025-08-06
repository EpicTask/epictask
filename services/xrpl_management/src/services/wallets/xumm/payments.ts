import { xrpToDrops } from "xrpl";
import { writeResponseToDatabase } from "../../../data/database";
import { PaymentRequest } from "../../../typings/models";
import { CreatedPayload } from "xumm-sdk/dist/src/types";
import { xummSdk } from "../../../config/clients";

type ResolveData = {
  payload_uuidv4: string;
  [key: string]: any;
};

export class PaymentHandler {
  async handlePaymentRequest(paymentRequest: PaymentRequest) {
    if (!xummSdk) {
      throw new Error("Xumm SDK not initialized.");
    }
    if (paymentRequest.user_token === null) {
      return await this.sendPaymentRequestNoUserToken(paymentRequest);
    } else {
      return await this.sendPaymentRequest(paymentRequest);
    }
  }

  private async sendPaymentRequest(paymentRequest: PaymentRequest) {
    const xummPayload = this.generatePayload(paymentRequest);

    try {
      if (!xummSdk) {
        throw new Error("Xumm SDK not initialized.");
      }
      const subscription = await xummSdk.payload?.create(xummPayload);
      if (subscription) {
        this.writeResponse(subscription, paymentRequest.task_id);
        return this.formatResponse(subscription);
      }
      return "Error creating subscription.";
    } catch (error) {
      console.error(`Error creating subscription: ${error}`);
      return `Error creating subscription: ${error}`;
    }
  }

  private async sendPaymentRequestNoUserToken(paymentRequest: PaymentRequest) {
    const xummPayload = this.generatePayload(paymentRequest);
    let resolveData: ResolveData | undefined;

    const callbackFunc = (event: any) => {
      console.log("Callback got here");
      try {
        const eventStatus = `New payload event: ${JSON.stringify(event.data)}`;
        console.log(eventStatus);
        if (event.data.signed === true || event.data.signed === false) {
          return event.data;
        }
      } catch (error) {
        console.error(`Error in callbackFunc: ${error}`);
      }
    };

    try {
      if (!xummSdk) {
        throw new Error("Xumm SDK not initialized.");
      }
      const createPayload = await xummSdk.payload?.create(xummPayload);
      if (createPayload) {
        const response = this.formatResponse(createPayload);
        console.log(response);
        const subscription = await xummSdk.payload!.subscribe(
          createPayload.uuid,
          callbackFunc
        );
        this.writeResponse(subscription, paymentRequest.task_id);
        console.log("Subscribe to payload");
        resolveData = (await subscription.resolved) as ResolveData;
        // xummSdk.payload!.unsubscribe();
      }
    } catch (error) {
      console.warn(`Caught RuntimeWarning: ${error}`);
    }

    if (resolveData) {
      if (!xummSdk) {
        throw new Error("Xumm SDK not initialized.");
      }
      const getPayload = await xummSdk.payload?.get(resolveData.payload_uuidv4);
      if (getPayload) {
        const getPayloadResp = this.formatResponse(getPayload);
        return getPayloadResp;
      }
    }
    return "Error processing payment.";
  }

  private generatePayload(paymentRequest: PaymentRequest) {
    return {
      txjson: {
        TransactionType: "Payment",
        Account: paymentRequest.source,
        Destination: paymentRequest.destination,
        Amount: String(xrpToDrops(paymentRequest.amount)),
      },
      Fee: "12",
      options: { expire: 3 },
      user_token: paymentRequest.user_token,
      custom_meta: {
        blob: { task_id: paymentRequest.task_id, function: "payment_request" },
      },
    };
  }

  private writeResponse(
    subscription: CreatedPayload | any,
    taskId: string | null | undefined
  ) {
    if (taskId) {
      writeResponseToDatabase(subscription, "payment_request", taskId);
    }
  }

  private formatResponse(payload: CreatedPayload) {
    return JSON.stringify(payload, null, 4);
  }
}
