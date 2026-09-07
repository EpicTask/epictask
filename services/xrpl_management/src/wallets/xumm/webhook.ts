import { writeResponseToDatabase } from "../../data/database.js";
import {
  notifyEscrowCreated,
  notifyEscrowReleased,
  notifyEscrowCancelled,
  notifyPaymentSent,
} from "../../services/notificationHelper.js";
import { updateUserToken } from "../../services/userTokenService.js";
import { reportSettlement } from "../../services/settlementService.js";
import { XummUserToken } from "./typings/index.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface XummWebhookBody<T = object> {
  payloadUuidv4: string;
  signed: boolean;
  userToken: XummUserToken | null;
  custom_meta: {
    blob: T;
    identifier: string;
  };
}

/** Shape of the blob object embedded in Xumm custom_meta for EpicTask payloads */
interface EpicTaskBlob {
  function:
    | "payment_request"
    | "create_escrow_xumm"
    | "finish_escrow_xumm"
    | "cancel_escrow_xumm"
    | string;
  uid?: string;      // Firebase UID of the user who initiated the transaction
  task_id?: string;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handleXummWebhook = async (
  webhookBody: XummWebhookBody
): Promise<{ status: string; docId?: string; message?: string }> => {
  try {
    const docId = await writeResponseToDatabase(webhookBody, "xumm_webhook");
    console.log("Webhook data saved with ID: ", docId);

    // Persist the Xumm userToken whenever present — enables future push-style
    // requests without requiring the user to scan a QR code.
    // Runs on every webhook callback (signed or rejected) because Xumm issues
    // the token when the payload is opened, not when it is signed.
    const blob = webhookBody.custom_meta?.blob as EpicTaskBlob | undefined;
    if (blob?.uid && webhookBody.userToken) {
      await updateUserToken(blob.uid, webhookBody.userToken);
    }

    // Only trigger notifications for user-signed (confirmed) transactions
    if (webhookBody.signed === true) {
      await _handleSignedTransaction(webhookBody);
    }

    return { status: "success", docId };
  } catch (error: any) {
    console.error("Error handling Xumm webhook:", error);
    return { status: "error", message: error.toString() };
  }
};

// ── Private ───────────────────────────────────────────────────────────────────

async function _handleSignedTransaction(
  webhookBody: XummWebhookBody
): Promise<void> {
  const blob = webhookBody.custom_meta?.blob as EpicTaskBlob | undefined;
  if (!blob) return;

  const { function: fn, uid, task_id } = blob;

  // uid is required for every notification — skip if absent
  // Settlement first, and deliberately before the uid check below.
  //
  // A settled credit only needs task_id — mono_service reads the amount,
  // currency and assignees from the task document. Gating it on uid would mean
  // never settling anything, because the payment payload's blob is built as
  // `{ task_id, function }` with no uid (see payments.ts generatePayload).
  //
  // create_escrow_xumm is excluded: locking funds is not releasing them.
  // cancel_escrow_xumm is not handled here either — a cancelled escrow leaves a
  // pending credit that will never settle, which the Phase 6 expiry job voids.
  if (task_id && (fn === "payment_request" || fn === "finish_escrow_xumm")) {
    await reportSettlement({
      task_id,
      payload_uuid: webhookBody.payloadUuidv4,
    });
  }

  if (!uid) {
    console.warn(
      `[webhook] Signed transaction for fn="${fn}" has no uid in blob; skipping notification.`
    );
    return;
  }

  try {
    switch (fn) {
      case "create_escrow_xumm":
        // Parent has signed the escrow creation — funds are now locked
        if (task_id) {
          await notifyEscrowCreated(uid, task_id);
        }
        break;

      case "finish_escrow_xumm":
        // Escrow has been finished — reward released to the recipient
        if (task_id) {
          await notifyEscrowReleased(uid, task_id);
        }
        break;

      case "cancel_escrow_xumm":
        // Escrow was cancelled — funds returned to the creator
        if (task_id) {
          await notifyEscrowCancelled(uid, task_id);
        }
        break;

      case "payment_request":
        // Direct XRP payment was signed and submitted
        await notifyPaymentSent(uid, task_id);
        break;

      default:
        // Unknown function — no notification needed
        console.info(`[webhook] No notification handler for fn="${fn}"`);
    }
  } catch (err) {
    // Notification failures must never propagate and fail the webhook response
    console.error("[webhook] Failed to dispatch notification:", err);
  }
}
