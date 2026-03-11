/**
 * notificationHelper.ts
 *
 * Lightweight helper that writes a notification record to Firestore and,
 * when the recipient has a registered push token, dispatches an FCM/APNs
 * message using the Firebase Admin SDK (already initialised via
 * middleware/firebase_auth.ts).
 *
 * This mirrors the behaviour of NotificationService._dispatch_fcm() in
 * mono_service, but runs inside xrpl_management so that XRPL-confirmed
 * events (payment signed, escrow created/released/cancelled) can trigger
 * push notifications without a service-to-service HTTP round-trip.
 */

import admin from "firebase-admin";

// ── Firestore collection constants (must match mono_service collection_names.py) ──
const COLLECTION_NOTIFICATIONS = "test_notifications";
const COLLECTION_USERS = "users";

// Notification type enum values (must match NotificationType in notification_models.py)
export const NotificationType = {
  PAYMENT_SENT: "PAYMENT_SENT",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  ESCROW_CREATED: "ESCROW_CREATED",
  ESCROW_RELEASED: "ESCROW_RELEASED",
  ESCROW_CANCELLED: "ESCROW_CANCELLED",
  SYSTEM_ALERT: "SYSTEM_ALERT",
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface NotificationPayload {
  recipient_id: string;
  title: string;
  message: string;
  type: NotificationTypeValue;
  metadata?: Record<string, string | null | undefined>;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Persist a notification to Firestore and attempt FCM/APNs dispatch.
 * Never throws — all errors are logged so callers are never blocked.
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<void> {
  try {
    await _writeToFirestore(payload);
  } catch (err) {
    console.error("[notificationHelper] Firestore write failed:", err);
    return; // Don't attempt FCM if we can't even persist
  }

  try {
    await _dispatchFcm(payload);
  } catch (err) {
    // FCM failures must never block the caller
    console.warn("[notificationHelper] FCM dispatch failed (non-fatal):", err);
  }
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export async function notifyEscrowCreated(
  uid: string,
  taskId: string
): Promise<void> {
  return sendNotification({
    recipient_id: uid,
    title: "Escrow Created 🔒",
    message: "Funds have been locked in escrow for your task reward.",
    type: NotificationType.ESCROW_CREATED,
    metadata: { task_id: taskId },
  });
}

export async function notifyEscrowReleased(
  uid: string,
  taskId: string
): Promise<void> {
  return sendNotification({
    recipient_id: uid,
    title: "Escrow Released 💸",
    message: "Your escrow reward has been released to your wallet!",
    type: NotificationType.ESCROW_RELEASED,
    metadata: { task_id: taskId },
  });
}

export async function notifyEscrowCancelled(
  uid: string,
  taskId: string
): Promise<void> {
  return sendNotification({
    recipient_id: uid,
    title: "Escrow Cancelled",
    message: "The escrow for your task has been cancelled and funds returned.",
    type: NotificationType.ESCROW_CANCELLED,
    metadata: { task_id: taskId },
  });
}

export async function notifyPaymentSent(
  uid: string,
  taskId: string | null | undefined,
  amount?: string
): Promise<void> {
  return sendNotification({
    recipient_id: uid,
    title: "Payment Sent ✅",
    message: amount
      ? `Payment of ${amount} XRP has been sent successfully.`
      : "Your payment has been sent successfully.",
    type: NotificationType.PAYMENT_SENT,
    metadata: { task_id: taskId ?? undefined },
  });
}

// ── Private helpers ───────────────────────────────────────────────────────────

async function _writeToFirestore(payload: NotificationPayload): Promise<void> {
  const firestore = admin.firestore();
  const docRef = firestore.collection(COLLECTION_NOTIFICATIONS).doc();
  await docRef.set({
    recipient_id: payload.recipient_id,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    metadata: payload.metadata ?? null,
    is_read: false,
    read_at: null,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function _getFcmToken(uid: string): Promise<string | null> {
  try {
    const firestore = admin.firestore();
    const doc = await firestore.collection(COLLECTION_USERS).doc(uid).get();
    if (!doc.exists) return null;
    return (doc.data()?.fcm_token as string) ?? null;
  } catch (err) {
    console.warn(`[notificationHelper] Could not fetch FCM token for ${uid}:`, err);
    return null;
  }
}

async function _clearFcmToken(uid: string): Promise<void> {
  try {
    const firestore = admin.firestore();
    await firestore
      .collection(COLLECTION_USERS)
      .doc(uid)
      .update({ fcm_token: null, fcm_token_platform: null });
  } catch (err) {
    console.warn(`[notificationHelper] Could not clear FCM token for ${uid}:`, err);
  }
}

async function _dispatchFcm(payload: NotificationPayload): Promise<void> {
  const token = await _getFcmToken(payload.recipient_id);
  if (!token) return; // No token registered — skip silently

  // Build string-only data map for FCM
  const dataMap: Record<string, string> = {
    notification_type: payload.type,
  };
  if (payload.metadata) {
    for (const [k, v] of Object.entries(payload.metadata)) {
      if (v != null) dataMap[k] = String(v);
    }
  }

  const message: admin.messaging.Message = {
    notification: {
      title: payload.title,
      body: payload.message,
    },
    data: dataMap,
    token,
    android: {
      notification: {
        channelId: "epictask_notifications",
        priority: "high",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
  };

  try {
    const msgId = await admin.messaging().send(message);
    console.log(
      `[notificationHelper] FCM sent to ${payload.recipient_id} ` +
        `[${payload.type}] msgId=${msgId}`
    );
  } catch (err: any) {
    // messaging/registration-token-not-registered → clean up stale token
    if (
      err?.errorInfo?.code === "messaging/registration-token-not-registered" ||
      err?.errorInfo?.code === "messaging/invalid-registration-token"
    ) {
      console.warn(
        `[notificationHelper] Stale FCM token for ${payload.recipient_id}; clearing.`
      );
      await _clearFcmToken(payload.recipient_id);
    } else {
      throw err; // Re-throw for the caller to log
    }
  }
}
