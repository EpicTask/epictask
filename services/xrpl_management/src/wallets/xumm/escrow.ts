import { xrpToDrops } from "xrpl";
import { xummSdk } from "../../config/clients";
import { createIdentifier, writeResponseToDatabase } from "../../data/database";
import { CreateEscrowModel, EscrowModel } from "../../typings/models";
import { XummPostPayloadResponse } from "xumm-sdk/dist/src/types";
import {
  sendNotification,
  NotificationType,
} from "../../services/notificationHelper.js";

type EscrowCreationResponse = {
  status: string;
};

type ErrorResponse = {
  error: string;
};

export class EscrowService {
  private datetime: Date;

  constructor() {
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
        (tenMinFromNow.getTime() - new Date(1970, 0, 1).getTime()) / 1000,
      ) - 946684800;
    return newTimestamp;
  }

  private createCancelAfterTimestamp(finish_after: number): number {
    const cancelAfterDatetime = new Date(
      finish_after * 1000 + 24 * 3600 * 1000,
    );
    return this.generateXRPLTimestamp(
      Math.floor(
        (cancelAfterDatetime.getTime() - new Date(1970, 0, 1).getTime()) / 1000,
      ),
    );
  }

  private isTimestampAfterCurrent(timestamp: number): boolean {
    return timestamp > Math.floor(new Date().getTime() / 1000);
  }

  public async createEscrowXumm(
    response: CreateEscrowModel,
  ): Promise<EscrowCreationResponse | ErrorResponse> {
    if (!xummSdk) {
      return { error: "Xumm SDK not initialized." };
    }
    const finishAfter = this.generateXRPLTimestamp(response.finish_after!);
    const cancelAfter =
      response.cancel_after ??
      this.createCancelAfterTimestamp(response.finish_after!);
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
      const payload = await xummSdk.payload?.create(escrowTx as any);
      if (payload) {
        writeResponseToDatabase(
          payload,
          "create_escrow_xumm",
          response.task_id,
        );

        // Notify the initiating user that escrow is pending their signature in Xumm
        sendNotification({
          recipient_id: response.user_id,
          title: "Escrow Signature Required 🔏",
          message: "Open Xumm to sign and lock funds in escrow for the task reward.",
          type: NotificationType.ESCROW_CREATED,
          metadata: { task_id: response.task_id },
        }).catch((err) =>
          console.warn("[escrow] Pending-create notification failed:", err)
        );
      }
      return { status: "Escrow successfully created." };
    } catch (error: any) {
      return { error: error.toString() };
    }
  }

  public async finishEscrowXumm(
    response: EscrowModel,
  ): Promise<XummPostPayloadResponse | ErrorResponse> {
    if (!xummSdk) {
      return { error: "Xumm SDK not initialized." };
    }
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
      const payload = await xummSdk.payload?.create(escrowFinish as any);
      if (payload) {
        writeResponseToDatabase(
          payload,
          "finish_escrow_xumm",
          response.task_id || undefined,
        );

        // Notify the initiating user that they need to sign the escrow release in Xumm
        if (response.user_id) {
          sendNotification({
            recipient_id: response.user_id,
            title: "Escrow Release Signature Required 🔏",
            message: "Open Xumm to sign and release the escrow reward.",
            type: NotificationType.ESCROW_RELEASED,
            metadata: { task_id: response.task_id ?? undefined },
          }).catch((err) =>
            console.warn("[escrow] Pending-finish notification failed:", err)
          );
        }
      }
      if (!payload) {
        return { error: "Failed to create payload." };
      }
      return payload;
    } catch (error: any) {
      return { error: error.toString() };
    }
  }

  public async cancelEscrowXumm(
    response: EscrowModel,
  ): Promise<XummPostPayloadResponse | ErrorResponse> {
    if (!xummSdk) {
      return { error: "Xumm SDK not initialized." };
    }
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
      const payload = await xummSdk.payload?.create(escrowTx as any);
      if (payload) {
        writeResponseToDatabase(
          payload,
          "cancel_escrow_xumm",
          response.task_id || undefined,
        );

        // Notify the initiating user that they need to sign the escrow cancellation in Xumm
        if (response.user_id) {
          sendNotification({
            recipient_id: response.user_id,
            title: "Escrow Cancellation Signature Required 🔏",
            message: "Open Xumm to sign and cancel the escrow. Funds will be returned.",
            type: NotificationType.ESCROW_CANCELLED,
            metadata: { task_id: response.task_id ?? undefined },
          }).catch((err) =>
            console.warn("[escrow] Pending-cancel notification failed:", err)
          );
        }
      }
      if (!payload) {
        return { error: "Failed to create payload." };
      }
      return payload;
    } catch (error: any) {
      return { error: error.toString() };
    }
  }
}
