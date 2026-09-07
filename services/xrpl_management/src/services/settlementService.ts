/**
 * Reports settled payments to mono_service, which owns the reward ledger.
 *
 * A Xumm "signed" webhook is the moment a reward stops being a promise: the
 * parent has signed and the transaction has been submitted. Until this fires,
 * the child's credit stays pending and does not count toward score or level.
 *
 * Note on strictness: `signed: true` means signed and submitted, not
 * necessarily validated on-ledger. The ledger listener is the only component
 * that can confirm validation; if you later need that guarantee, settle from
 * there instead and treat this as an intermediate state.
 */

const MONO_SERVICE_URL = process.env.MONO_SERVICE_URL;
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

export interface SettlementNotice {
  task_id: string;
  tx_hash?: string;
  payload_uuid?: string;
}

/**
 * Tell mono_service a task's payment settled.
 *
 * Only task_id is authoritative — mono_service reads the amount, currency and
 * assignees from the task document, so this service is never trusted about how
 * much a child earned.
 *
 * Returns true when the credit was recorded. Never throws: a webhook must still
 * be acked, and the credit is idempotent, so a lost call can be safely retried
 * by a later replay rather than failing the whole webhook.
 */
export const reportSettlement = async (
  notice: SettlementNotice,
): Promise<boolean> => {
  if (!MONO_SERVICE_URL) {
    console.error("[settlement] MONO_SERVICE_URL unset; cannot record settlement");
    return false;
  }
  if (!INTERNAL_SERVICE_TOKEN) {
    console.error("[settlement] INTERNAL_SERVICE_TOKEN unset; cannot record settlement");
    return false;
  }

  try {
    const res = await fetch(`${MONO_SERVICE_URL}/api/internal/settlement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": INTERNAL_SERVICE_TOKEN,
      },
      body: JSON.stringify(notice),
    });

    if (!res.ok) {
      // Loud on purpose. A silent failure here means a child was paid on the
      // ledger but never credited in the app, which is the worst of both.
      console.error(
        `[settlement] mono_service rejected settlement for task ${notice.task_id}: ${res.status}`,
      );
      return false;
    }

    console.info(`[settlement] recorded settlement for task ${notice.task_id}`);
    return true;
  } catch (err) {
    console.error(
      `[settlement] failed to report settlement for task ${notice.task_id}:`,
      err,
    );
    return false;
  }
};
