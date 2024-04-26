import { xrpToDrops } from "xrpl";
import { XRPLClient, XummSDK } from "../../config/clients";
import { writeResponseToDatabase } from "../../controllers/database";

export class PaymentHandler {
  private client: any;
  private sdk: any;

  constructor() {
    const clientClass = new XRPLClient();
    const xummSdk = new XummSDK();
    this.client = clientClass.getClient();
    this.sdk = xummSdk.sdk;
  }

  async handlePaymentRequest(paymentRequest: PaymentRequest) {
    if (paymentRequest.user_token === null) {
      return await this.sendPaymentRequestNoUserToken(paymentRequest);
    } else {
      return await this.sendPaymentRequest(paymentRequest);
    }
  }

  private async sendPaymentRequest(paymentRequest: PaymentRequest) {
    const xummPayload = this.generatePayload(paymentRequest);

    try {
      const subscription = this.sdk.payload.create(xummPayload);
      this.writeResponse(subscription, paymentRequest.task_id);
      return this.formatResponse(subscription);
    } catch (error) {
      console.error(`Error creating subscription: ${error}`);
      return `Error creating subscription: ${error}`;
    }
  }

  private async sendPaymentRequestNoUserToken(paymentRequest: PaymentRequest) {
    const xummPayload = this.generatePayload(paymentRequest);
    let resolveData: any;

    const callbackFunc = (event: any) => {
      console.log("Callback got here");
      try {
        const eventStatus = `New payload event: ${event.data}`;
        console.log(eventStatus);
        if (event.data.includes("expired") || event.data.includes("signed")) {
          return event.data;
        }
      } catch (error) {
        console.error(`Error in callbackFunc: ${error}`);
      }
    };

    try {
      const createPayload = this.sdk.payload.create(xummPayload);
      const response = this.formatResponse(createPayload);
      console.log(response);
      const subscription = await this.sdk.payload.subscribe(
        createPayload.uuid,
        callbackFunc
      );
      this.writeResponse(subscription, paymentRequest.task_id);
      console.log("Subscribe to payload");
      resolveData = await subscription.resolved();
      this.sdk.payload.unsubscribe();
    } catch (error) {
      console.warn(`Caught RuntimeWarning: ${error}`);
    }

    const getPayload = this.sdk.payload.get(resolveData.payload_uuidv4);
    const getPayloadResp = this.formatResponse(getPayload);
    return getPayloadResp;
  }

  private generatePayload(paymentRequest: PaymentRequest) {
    return {
      txjson: {
        TransactionType: paymentRequest.type,
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

  private writeResponse(subscription: any, taskId: string) {
    writeResponseToDatabase(subscription.to_dict(), "payment_request", taskId);
  }

  private formatResponse(payload: any) {
    return JSON.stringify(payload.to_dict(), null, 4);
  }
}
