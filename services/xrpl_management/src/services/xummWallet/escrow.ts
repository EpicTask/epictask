import { xrpToDrops } from "xrpl";
import { XRPLClient, XummSDK } from "../../config/clients";
import {
  createIdentifier,
  writeResponseToDatabase,
} from "../../controllers/database";

export class EscrowService {
  private client: any;
  private sdk: any;
  private datetime: Date;

  constructor() {
    const clientClass = new XRPLClient();
    const xummSdk = new XummSDK();
    this.client = clientClass.getClient();
    this.sdk = xummSdk.sdk;
    this.datetime = new Date();
  }

  private generateXRPLTimestamp(timestamp: number | undefined): number {
    if (timestamp === undefined) {
      return this.createTenMinTimestamp();
    }
    return timestamp - 946684800;
  }
  private createTenMinTimestamp(): number {
    const tenMinFromNow = new Date(this.datetime.getTime() + 10 * 60000);
    const newTimestamp =
      Math.floor(
        (tenMinFromNow.getTime() - new Date(1970, 0, 1).getTime()) / 1000
      ) - 946684800;
    return newTimestamp;
  }

  private createCancelAfterTimestamp(finish_after: number): number {
    const cancelAfterDatetime = new Date(
      finish_after * 1000 + 24 * 3600 * 1000
    );
    return this.generateXRPLTimestamp(
      Math.floor(
        (cancelAfterDatetime.getTime() - new Date(1970, 0, 1).getTime()) / 1000
      )
    );
  }

  private isTimestampAfterCurrent(timestamp: number): boolean {
    return timestamp > Math.floor(new Date().getTime() / 1000);
  }

  public async createEscrowXumm(response: CreateEscrowModel): Promise<any> {
    const finishAfter = this.generateXRPLTimestamp(response.finish_after);
    const cancelAfter =
      response.cancel_after ??
      this.createCancelAfterTimestamp(response.finish_after);
    const amount = String(xrpToDrops(response.amount));
    const identifier = createIdentifier();

    try {
      const escrowTx = {
        txjson: {
          TransactionType: "EscrowCreate",
          Account: response.account,
          Destination: response.destination,
          Amount: amount,
          FinishAfter: finishAfter,
          CancelAfter: cancelAfter,
        },
        user_token: response.user_token,
        custom_meta: {
          blob: {
            task_id: response.task_id,
            uid: response.user_id,
            function: "create_escrow_xumm",
          },
          identifier: identifier,
        },
      };
      const payload = this.sdk.payload.create(escrowTx);
      writeResponseToDatabase(
        payload.to_dict(),
        "create_escrow_xumm",
        response.task_id
      );
      return { status: "Escrow successfully created." };
    } catch (error) {
      // Handle the error appropriately
      return { error: error.toString() };
    }
  }

  public async finishEscrowXumm(response: EscrowModel): Promise<any> {
    const identifier = createIdentifier();

    try {
      const escrowFinish = {
        txjson: {
          TransactionType: "EscrowFinish",
          Account: response.account,
          Owner: response.owner,
          OfferSequence: response.offer_sequence,
        },
        user_token: response.user_token,
        custom_meta: {
          blob: {
            task_id: response.task_id,
            uid: response.user_id,
            function: "finish_escrow_xumm",
          },
          identifier: identifier,
        },
      };
      const payload = this.sdk.payload.create(escrowFinish);
      writeResponseToDatabase(
        payload.to_dict(),
        "finish_escrow_xumm",
        response.task_id
      );
      return payload.to_dict();
    } catch (error) {
      // Handle the error appropriately
      return { error: error.toString() };
    }
  }

  public async cancelEscrowXumm(response: EscrowModel): Promise<any> {
    const identifier = createIdentifier();

    try {
      const escrowTx = {
        txjson: {
          TransactionType: "EscrowCancel",
          Account: response.account,
          Owner: response.owner,
          OfferSequence: response.offer_sequence,
        },
        user_token: response.user_token,
        custom_meta: {
          blob: {
            task_id: response.task_id,
            uid: response.user_id,
            function: "cancel_escrow_xumm",
          },
          identifier: identifier,
        },
      };
      const payload = this.sdk.payload.create(escrowTx);
      writeResponseToDatabase(
        payload.to_dict(),
        "cancel_escrow_xumm",
        response.task_id
      );
      return payload.to_dict();
    } catch (error) {
      // Handle the error appropriately
      return { error: error.toString() };
    }
  }
}
