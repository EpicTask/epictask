/**
 * userTokenService.ts
 *
 * Persists the Xumm userToken to the user's Firestore document via the
 * Firebase Admin SDK (already initialised via middleware/firebase_auth.ts).
 *
 * The userToken is issued by Xumm when a user opens a payload and enables
 * future push-style (non-QR) transaction requests — i.e. sending a sign
 * request directly to the user's Xumm app without showing a QR code.
 */

import admin from "firebase-admin";
import { XummUserToken } from "../wallets/xumm/typings/index.js";

const COLLECTION_USERS = "users";

/**
 * Updates the `userToken` field on the user's Firestore document.
 *
 * Called from the Xumm webhook handler whenever a webhook payload contains
 * both a valid `uid` (from `custom_meta.blob.uid`) and a non-null `userToken`.
 * The update is fire-and-forget from the caller's perspective — this function
 * never throws, matching the pattern established by notificationHelper.ts.
 *
 * @param uid       Firebase UID of the user who opened the Xumm payload
 * @param userToken The userToken object returned by Xumm in the webhook body
 */
export async function updateUserToken(
  uid: string,
  userToken: XummUserToken
): Promise<void> {
  if (!uid || !userToken?.user_token) {
    console.warn(
      "[userTokenService] Missing uid or userToken.user_token — skipping update."
    );
    return;
  }

  try {
    const firestore = admin.firestore();
    await firestore.collection(COLLECTION_USERS).doc(uid).update({
      userToken,
    });
    console.log(`[userTokenService] userToken updated for uid=${uid}`);
  } catch (err) {
    // Failures must never propagate and fail the webhook response
    console.error(
      `[userTokenService] Failed to update userToken for uid=${uid}:`,
      err
    );
  }
}
