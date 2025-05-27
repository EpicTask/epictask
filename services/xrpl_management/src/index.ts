import Koa from "koa";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import Router from "koa-router";
import views from "@ladjs/koa-views";
import serve from "koa-static";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { accountService } from "./services/xrpLedger/account.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const router = new Router();

// Middleware to handle json responses
app.use(json());
// Middleware to parse request bodies
app.use(bodyParser());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const typedErr = err as { status?: number; message: string };
    ctx.status = typedErr.status || 500;
    ctx.body = {
      error: typedErr.message,
    };
  }
});

app.use(views(path.join(__dirname, "../src/templates"), { extension: "ejs" })); 


app.use(serve(path.join(__dirname, "../src/static")));

// *** Primary Functions - Placeholder Handlers ***

// GET /xchain_payment_request
router.get("/xchain_payment_request", async (ctx) => {
  // TODO: Implement actual logic similar to handle_xchain_payment_request
  // Example: const queryParams = ctx.query;
  ctx.body = { message: "XChain payment request placeholder", data: {} };
});

// GET /xummSignInRequest/:uid
router.get("/xummSignInRequest/:uid", async (ctx) => {
  const { uid } = ctx.params;
  // TODO: Implement actual logic similar to connectWallet(uid)
  ctx.body = { message: `XUMM Sign In request for UID: ${uid}`, data: {} };
});

// POST /payment_request
router.post("/payment_request", async (ctx) => {
  const paymentRequest = ctx.request.body as any; // TODO: Define and use a proper PaymentRequest interface
  // TODO: Implement actual logic similar to handle_payment_request(paymentRequest)
  ctx.body = { message: "Payment request processed placeholder", request: paymentRequest };
});

// GET /lookup_escrow/:account
router.get("/lookup_escrow/:account", async (ctx) => {
  const { account } = ctx.params;
  // TODO: Implement actual logic similar to lookup_escrow(account)
  ctx.body = { message: `Lookup escrow for account: ${account}`, data: {} };
});

// POST /create_escrow
router.post("/create_escrow", async (ctx) => {
  const createEscrowModel = ctx.request.body as any; // TODO: Define and use a proper CreateEscrowModel interface
  // Example validation based on Python code:
  // const finishAfter = createEscrowModel?.finish_after;
  // if (!createEscrowModel || (finishAfter && !is_timestamp_after_current(finishAfter))) { // Define is_timestamp_after_current
  //   ctx.status = 400;
  //   ctx.body = { error: "Missing or invalid required parameters." };
  //   return;
  // }
  // TODO: Implement actual logic similar to create_escrow_xumm(createEscrowModel)
  ctx.body = { message: "Create escrow placeholder", data: createEscrowModel };
});

// POST /cancel_escrow_xumm
router.post("/cancel_escrow_xumm", async (ctx) => {
  const escrowModel = ctx.request.body as any; // TODO: Define and use a proper EscrowModel interface
  // Example validation:
  // if (!escrowModel || !Object.keys(escrowModel).length) { // Check if body is empty or missing required fields
  //   ctx.status = 400;
  //   ctx.body = { error: "Missing request body or required parameters." };
  //   return;
  // }
  // TODO: Implement actual logic similar to cancel_escrow_xumm(escrowModel)
  ctx.body = { message: "Cancel escrow placeholder", data: escrowModel };
});

// POST /finish_escrow_xumm
router.post("/finish_escrow_xumm", async (ctx) => {
  const escrowModel = ctx.request.body as any; // TODO: Define and use a proper EscrowModel interface
  // Example validation:
  // if (!escrowModel || !Object.keys(escrowModel).length) {
  //   ctx.status = 400;
  //   ctx.body = { error: "Missing request body or required parameters." };
  //   return;
  // }
  // TODO: Implement actual logic similar to finish_escrow_xumm(escrowModel)
  ctx.body = { message: "Finish escrow placeholder", data: escrowModel };
});

// *** Account Functions - Placeholder Handlers ***

// GET /balance/:address
router.get("/balance/:address", async (ctx) => {
  const { address } = ctx.params;
  const account_balance = accountService.getXrpBalance(address);
  ctx.body = { address, balance: account_balance };
});

// GET /account_info/:address
router.get("/account_info/:address", async (ctx) => {
  const { address } = ctx.params;
  // TODO: Implement actual logic similar to xrpscan_get_accountInfo(address)
  ctx.body = { message: `Account info for ${address}`, data: {} };
});

// GET /account_exists/:address
router.get("/account_exists/:address", async (ctx) => {
  const { address } = ctx.params;
  // TODO: Implement actual logic similar to does_account_exist_async(address)
  // TODO: Implement write_response_to_firestore if needed
  const exists = true; // Placeholder
  const response = { address, exists };
  ctx.body = response;
});

// GET /test_net/balance/:address
router.get("/test_net/balance/:address", async (ctx) => {
  const { address } = ctx.params;
  // TODO: Implement actual logic similar to get_account_balance(address) (async)
  // TODO: Implement write_response_to_firestore if needed
  const account_balance = "placeholder_testnet_balance"; // Placeholder
  const response = { address, balance: account_balance };
  // const doc_id = "placeholder_doc_id"; // from write_response_to_firestore
  ctx.body = { /*doc_id,*/ response };
});

// GET /test_net/account_info/:address
router.get("/test_net/account_info/:address", async (ctx) => {
  const { address } = ctx.params;
  // TODO: Implement actual logic similar to get_account_info_async(address)
  // TODO: Implement write_response_to_firestore if needed
  const accountInfoResult = { info: "placeholder_testnet_account_info" }; // Placeholder for the .result part
  // const doc_id = "placeholder_doc_id"; // from write_response_to_firestore
  ctx.body = { /*doc_id,*/ result: accountInfoResult };
});

// *** Transactions - Placeholder Handlers ***

// GET /verify_transaction/:tx_hash/:task_id?
router.get("/verify_transaction/:tx_hash/:task_id?", async (ctx) => {
  const { tx_hash, task_id } = ctx.params; // task_id will be undefined if not provided
  if (!tx_hash) {
    ctx.status = 400;
    ctx.body = { error: "Missing 'tx_hash' parameter." };
    return;
  }
  // TODO: Implement actual logic similar to get_transaction_async(tx_hash)
  // TODO: Implement write_response_to_firestore if needed, passing task_id
  const transactionResult = { details: "placeholder_transaction_details" }; // Placeholder for the .result part
  const response = { transaction_hash: tx_hash, transaction: transactionResult };
  // const doc_id = "placeholder_doc_id"; // from write_response_to_firestore
  ctx.body = { /*doc_id,*/ response };
});

// GET /transactions/:address
router.get("/transactions/:address", async (ctx) => {
  const { address } = ctx.params;
  // TODO: Implement actual logic similar to get_transactions(address)
  const transactions = [{ id: "tx1" }, { id: "tx2" }]; // Placeholder
  ctx.body = transactions;
});

// GET /recordTransactions/:address
router.get("/recordTransactions/:address", async (ctx) => {
  const { address } = ctx.params;
  // TODO: Implement actual logic similar to get_transactions(address, 500)
  // TODO: Implement write_to_gcs(address, transactions) if needed
  const transactions = [{ id: "tx1_recorded" }, { id: "tx2_recorded" }]; // Placeholder
  ctx.body = transactions;
});

// GET /xrpl_timestamp
router.get("/xrpl_timestamp", async (ctx) => {
  const timestampInput = ctx.query.timestamp as string | undefined;
  // TODO: Implement actual logic similar to generate_xrpl_timestamp(timestamp)
  if (!timestampInput || isNaN(parseInt(timestampInput))) {
    ctx.status = 400;
    ctx.body = { error: "Missing or invalid 'timestamp' query parameter." };
    return;
  }
  const numericTimestamp = parseInt(timestampInput);
  // const generatedTimestamp = await generate_xrpl_timestamp_logic(numericTimestamp);
  ctx.body = { message: `XRPL timestamp for ${numericTimestamp}`, generated_timestamp: {} /* generatedTimestamp */ };
});

router.get("/", async (ctx) => {
  await ctx.render("index", { title: "XRPL Management Service" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(router.routes());
app.use(router.allowedMethods());
// node --loader ts-node/esm --experimental-specifier-resolution=node ./dist/src/services/xrpLedger/account.js