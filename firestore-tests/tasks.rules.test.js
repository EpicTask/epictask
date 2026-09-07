/**
 * Security Rules tests for task write access.
 *
 * These exist because rules are the only thing preventing a child from setting
 * `verified`/`rewarded` on their own task and self-approving an XRP payment.
 * See resources/rewards_leaderboard_review.md §3.
 *
 * Run: npm test   (wraps `firebase emulators:exec --only firestore`)
 */
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

const PARENT = "parent_1";
const CHILD = "child_1";
const STRANGER = "stranger_1";

// The live collection: all writes are test-prefixed except `users`.
const TASKS = "test_tasks";
const TASK_ID = "task_abc";

const baseTask = {
  task_id: TASK_ID,
  user_id: PARENT,
  assigned_to_ids: [CHILD],
  task_title: "Take out the bins",
  reward_amount: 5,
  reward_currency: "XRP",
  payment_method: "Pay Directly",
  marked_completed: true,
  verified: false,
  rewarded: false,
};

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-epictask",
    firestore: {
      rules: readFileSync("../firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8085,
    },
  });
});

test.after(async () => {
  await testEnv?.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    // `me()` in canAccessTask() reads these.
    await setDoc(doc(db, "users", PARENT), {
      uid: PARENT,
      role: "parent",
      children: [CHILD],
    });
    await setDoc(doc(db, "users", CHILD), {
      uid: CHILD,
      role: "child",
      parent_id: PARENT,
    });
    await setDoc(doc(db, "users", STRANGER), { uid: STRANGER, role: "parent" });
    await setDoc(doc(db, TASKS, TASK_ID), baseTask);
  });
});

const asParent = () => testEnv.authenticatedContext(PARENT).firestore();
const asChild = () => testEnv.authenticatedContext(CHILD).firestore();
const asStranger = () => testEnv.authenticatedContext(STRANGER).firestore();
const asAnon = () => testEnv.unauthenticatedContext().firestore();

// ---------------------------------------------------------------------------
// The vulnerability this suite exists to prevent
// ---------------------------------------------------------------------------

test("child CANNOT verify their own task", async () => {
  await assertFails(
    updateDoc(doc(asChild(), TASKS, TASK_ID), { verified: true }),
  );
});

test("child CANNOT reward their own task", async () => {
  await assertFails(
    updateDoc(doc(asChild(), TASKS, TASK_ID), {
      rewarded: true,
      rewardedAt: new Date().toISOString(),
    }),
  );
});

test("child CANNOT reprice their own task", async () => {
  await assertFails(
    updateDoc(doc(asChild(), TASKS, TASK_ID), { reward_amount: 9999 }),
  );
});

test("child CANNOT reassign the task to themselves only", async () => {
  await assertFails(
    updateDoc(doc(asChild(), TASKS, TASK_ID), { assigned_to_ids: [CHILD] }),
  );
});

test("child has NO client write path at all (completion goes via mono_service)", async () => {
  await assertFails(
    updateDoc(doc(asChild(), TASKS, TASK_ID), { marked_completed: true }),
  );
});

// ---------------------------------------------------------------------------
// Server-only fields: no client, not even the creating parent
// ---------------------------------------------------------------------------

test("parent CANNOT set verified (server-only field)", async () => {
  await assertFails(
    updateDoc(doc(asParent(), TASKS, TASK_ID), { verified: true }),
  );
});

test("parent CANNOT set payment_submitted (server-only field)", async () => {
  await assertFails(
    updateDoc(doc(asParent(), TASKS, TASK_ID), { payment_submitted: true }),
  );
});

test("parent CANNOT smuggle a reprice alongside the reward flip", async () => {
  await assertFails(
    updateDoc(doc(asParent(), TASKS, TASK_ID), {
      rewarded: true,
      reward_amount: 9999,
    }),
  );
});

test("parent CANNOT edit task content client-side (goes via taskService.updateTask)", async () => {
  await assertFails(
    updateDoc(doc(asParent(), TASKS, TASK_ID), { task_title: "changed" }),
  );
});

// ---------------------------------------------------------------------------
// The one temporary carve-out — remove at rewards-phase-2
// ---------------------------------------------------------------------------

test("parent CAN flip rewarded false -> true (temporary carve-out)", async () => {
  await assertSucceeds(
    updateDoc(doc(asParent(), TASKS, TASK_ID), {
      rewarded: true,
      rewardedAt: new Date().toISOString(),
    }),
  );
});

test("parent CANNOT un-reward (rewarded is monotonic)", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await updateDoc(doc(ctx.firestore(), TASKS, TASK_ID), { rewarded: true });
  });
  await assertFails(
    updateDoc(doc(asParent(), TASKS, TASK_ID), { rewarded: false }),
  );
});

// ---------------------------------------------------------------------------
// Ambient access control
// ---------------------------------------------------------------------------

test("unrelated user CANNOT update the task", async () => {
  await assertFails(
    updateDoc(doc(asStranger(), TASKS, TASK_ID), { rewarded: true }),
  );
});

test("anonymous CANNOT read or write the task", async () => {
  await assertFails(getDoc(doc(asAnon(), TASKS, TASK_ID)));
  await assertFails(updateDoc(doc(asAnon(), TASKS, TASK_ID), { rewarded: true }));
});

test("parent and assigned child CAN read the task", async () => {
  await assertSucceeds(getDoc(doc(asParent(), TASKS, TASK_ID)));
  await assertSucceeds(getDoc(doc(asChild(), TASKS, TASK_ID)));
});

test("unrelated user CANNOT read the task", async () => {
  await assertFails(getDoc(doc(asStranger(), TASKS, TASK_ID)));
});

test("creator CAN delete, child CANNOT", async () => {
  await assertFails(deleteDoc(doc(asChild(), TASKS, TASK_ID)));
  await assertSucceeds(deleteDoc(doc(asParent(), TASKS, TASK_ID)));
});

// ---------------------------------------------------------------------------
// Create guards
// ---------------------------------------------------------------------------

test("cannot create a task with reward state preset", async () => {
  const db = asParent();
  await assertFails(
    setDoc(doc(db, TASKS, "new_1"), { ...baseTask, task_id: "new_1", rewarded: true }),
  );
  await assertFails(
    setDoc(doc(db, TASKS, "new_2"), { ...baseTask, task_id: "new_2", verified: true }),
  );
});

test("cannot create a task owned by someone else", async () => {
  await assertFails(
    setDoc(doc(asChild(), TASKS, "new_3"), { ...baseTask, task_id: "new_3", user_id: PARENT }),
  );
});

// ---------------------------------------------------------------------------
// Parity: the unprefixed mirror must be hardened identically
// ---------------------------------------------------------------------------

test("unprefixed `tasks` mirror is hardened identically", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "tasks", TASK_ID), baseTask);
  });
  await assertFails(
    updateDoc(doc(asChild(), "tasks", TASK_ID), { verified: true }),
  );
  await assertSucceeds(
    updateDoc(doc(asParent(), "tasks", TASK_ID), { rewarded: true }),
  );
});

// ---------------------------------------------------------------------------
// Reward ledger: Admin SDK writes only, family reads
// ---------------------------------------------------------------------------

const REWARD_EVENTS = "test_reward_events";

async function seedRewardEvent(env, userId = CHILD) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), REWARD_EVENTS, `task_abc:pending`), {
      event_id: "task_abc:pending",
      user_id: userId,
      source: "task",
      source_id: "task_abc",
      state: "pending",
      amount: 5,
      currency: "XRP",
    });
  });
}

test("child CAN read their own reward events", async () => {
  await seedRewardEvent(testEnv);
  await assertSucceeds(getDoc(doc(asChild(), REWARD_EVENTS, "task_abc:pending")));
});

test("parent CAN read their child's reward events", async () => {
  await seedRewardEvent(testEnv);
  await assertSucceeds(getDoc(doc(asParent(), REWARD_EVENTS, "task_abc:pending")));
});

test("unrelated user CANNOT read someone else's reward events", async () => {
  await seedRewardEvent(testEnv);
  await assertFails(getDoc(doc(asStranger(), REWARD_EVENTS, "task_abc:pending")));
});

test("nobody can write a reward event — not child, parent, or stranger", async () => {
  const forged = {
    event_id: "forged:settled",
    user_id: CHILD,
    source: "task",
    source_id: "forged",
    state: "settled",
    amount: 999999,
    currency: "XRP",
  };
  await assertFails(setDoc(doc(asChild(), REWARD_EVENTS, "forged:settled"), forged));
  await assertFails(setDoc(doc(asParent(), REWARD_EVENTS, "forged:settled"), forged));
  await assertFails(setDoc(doc(asStranger(), REWARD_EVENTS, "forged:settled"), forged));
});

test("nobody can mutate or delete an existing reward event (append-only)", async () => {
  await seedRewardEvent(testEnv);
  await assertFails(
    updateDoc(doc(asParent(), REWARD_EVENTS, "task_abc:pending"), { amount: 999 }),
  );
  await assertFails(deleteDoc(doc(asParent(), REWARD_EVENTS, "task_abc:pending")));
});

test("the projection stays read-only to clients", async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "test_leaderboard", CHILD), {
      user_id: CHILD,
      token_score: 10,
    });
  });
  await assertSucceeds(getDoc(doc(asChild(), "test_leaderboard", CHILD)));
  await assertFails(
    updateDoc(doc(asChild(), "test_leaderboard", CHILD), { token_score: 999999 }),
  );
});
