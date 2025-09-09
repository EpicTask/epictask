import Koa from "koa";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import Router from "koa-router";
import views from "@ladjs/koa-views";
import serve from "koa-static";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectWallet } from "./services/wallets/xumm/signin.js";
import { PaymentHandler } from "./services/wallets/xumm/payments.js";
import { EscrowService } from "./services/wallets/xumm/escrow.js";
import { handleXummWebhook, XummWebhookBody } from "./services/wallets/xumm/webhook.js";
import { crossmarkService } from "./services/wallets/crossmark/index.js";
import { accountService } from "./ledger/account.js";
import { ledgerListener } from "./ledger/listener.js";
import { TransactionBuilder } from "./ledger/builder.js";
import { PaymentRequest, CreateEscrowModel, EscrowModel } from "./typings/models.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const router = new Router();

// Initialize ledger listener on startup
const initializeLedgerListener = async () => {
  try {
    await ledgerListener.startListening();
    console.log("Ledger listener initialized successfully");
  } catch (error) {
    console.error("Failed to initialize ledger listener:", error);
  }
};

// Middleware to handle json responses
app.use(json());
// Middleware to parse request bodies
app.use(bodyParser());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    let errorMessage = "An unknown error occurred.";
    let errorStatus = 500;

    if (err instanceof Error) {
      errorMessage = err.message;
    }

    // Check for Koa-specific error properties
    if (typeof err === 'object' && err !== null) {
      if ('status' in err && typeof err.status === 'number') {
        errorStatus = err.status;
      }
      if ('message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      }
    }
    
    ctx.status = errorStatus;
    ctx.body = {
      error: errorMessage,
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
  const signInUrl = await connectWallet(uid);
  ctx.body = { message: `XUMM Sign In request for UID: ${uid}`, data: { signInUrl } };
});

// POST /payment_request
router.post("/payment_request", async (ctx) => {
  const paymentRequest = ctx.request.body as PaymentRequest;
  const paymentHandler = new PaymentHandler();
  const result = await paymentHandler.handlePaymentRequest(paymentRequest);
  ctx.body = { message: "Payment request processed", data: result };
});

// GET /lookup_escrow/:account
router.get("/lookup_escrow/:account", async (ctx) => {
  const { account } = ctx.params;
  const escrows = await accountService.lookupEscrow(account);
  ctx.body = { account, escrows };
});

// POST /create_escrow
router.post("/create_escrow", async (ctx) => {
  const createEscrowModel = ctx.request.body as CreateEscrowModel;
  const escrowService = new EscrowService();
  const result = await escrowService.createEscrowXumm(createEscrowModel);
  ctx.body = { message: "Create escrow placeholder", data: result };
});

// POST /cancel_escrow_xumm
router.post("/cancel_escrow_xumm", async (ctx) => {
  const escrowModel = ctx.request.body as EscrowModel;
  const escrowService = new EscrowService();
  const result = await escrowService.cancelEscrowXumm(escrowModel);
  ctx.body = { message: "Cancel escrow placeholder", data: result };
});

// POST /finish_escrow_xumm
router.post("/finish_escrow_xumm", async (ctx) => {
  const escrowModel = ctx.request.body as EscrowModel;
  const escrowService = new EscrowService();
  const result = await escrowService.finishEscrowXumm(escrowModel);
  ctx.body = { message: "Finish escrow placeholder", data: result };
});

// POST /xumm/webhook
router.post("/xumm/webhook", async (ctx) => {
  const webhookBody = ctx.request.body as XummWebhookBody;
  const result = await handleXummWebhook(webhookBody);
  ctx.body = result;
  ctx.status = 200;
});

// *** Crossmark Endpoints ***

router.post("/crossmark/signin", async (ctx) => {
    try {
        const result = await crossmarkService.signIn();
        ctx.body = result;
        if (!result.success) {
            ctx.status = 400;
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/crossmark/payment_request", async (ctx) => {
    try {
        const paymentRequest = ctx.request.body as PaymentRequest;
        const result = await crossmarkService.handlePaymentRequest(paymentRequest);
        ctx.body = result;
        if (!result.success) {
            ctx.status = 400;
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/crossmark/create_escrow", async (ctx) => {
    try {
        const escrowRequest = ctx.request.body as CreateEscrowModel;
        const result = await crossmarkService.createEscrow(escrowRequest);
        ctx.body = result;
        if (!result.success) {
            ctx.status = 400;
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/crossmark/finish_escrow", async (ctx) => {
    try {
        const escrowRequest = ctx.request.body as EscrowModel;
        const result = await crossmarkService.finishEscrow(escrowRequest);
        ctx.body = result;
        if (!result.success) {
            ctx.status = 400;
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/crossmark/cancel_escrow", async (ctx) => {
    try {
        const escrowRequest = ctx.request.body as EscrowModel;
        const result = await crossmarkService.cancelEscrow(escrowRequest);
        ctx.body = result;
        if (!result.success) {
            ctx.status = 400;
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/crossmark/sign_transaction", async (ctx) => {
    try {
        const tx = ctx.request.body as any;
        const result = await crossmarkService.signTransaction(tx);
        ctx.body = result;
        if (!result.success) {
            ctx.status = 400;
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.get("/crossmark/status", async (ctx) => {
    try {
        const isAvailable = crossmarkService.isAvailable();
        const version = await crossmarkService.getVersion();
        ctx.body = {
            available: isAvailable,
            version: version
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});


// *** Account Functions ***

// GET /balance/:address
router.get("/balance/:address", async (ctx) => {
  const { address } = ctx.params;
  const balance = await accountService.getXrpBalance(address);
  ctx.body = { address, balance };
});

// GET /account_info/:address
router.get("/account_info/:address", async (ctx) => {
  const { address } = ctx.params;
  const accountInfo = await accountService.getAccountInfo(address);
  ctx.body = { address, accountInfo };
});

// GET /account_exists/:address
router.get("/account_exists/:address", async (ctx) => {
  const { address } = ctx.params;
  const exists = await accountService.accountExists(address);
  ctx.body = { address, exists };
});

// *** Transactions ***

// GET /verify_transaction/:tx_hash
router.get("/verify_transaction/:tx_hash", async (ctx) => {
  const { tx_hash } = ctx.params;
  const transaction = await accountService.verifyTransaction(tx_hash);
  ctx.body = { transaction_hash: tx_hash, transaction };
});

// GET /transactions/:address
router.get("/transactions/:address", async (ctx) => {
  const { address } = ctx.params;
  const limit = ctx.query.limit ? Number(ctx.query.limit) : undefined;
  const transactions = await accountService.getTransactions(address, limit);
  ctx.body = { address, transactions };
});

// GET /xrpl_timestamp
// router.get("/xrpl_timestamp", async (ctx) => {
//   const timestampInput = ctx.query.timestamp as string | undefined;
//   const numericTimestamp = timestampInput ? parseInt(timestampInput) : undefined;
//   if (timestampInput && isNaN(numericTimestamp)) {
//     ctx.status = 400;
//     ctx.body = { error: "Invalid 'timestamp' query parameter." };
//     return;
//   }
//   const generatedTimestamp = accountService.generateXrplTimestamp(numericTimestamp);
//   ctx.body = { message: `XRPL timestamp for ${numericTimestamp || 'now'}`, generated_timestamp: generatedTimestamp };
// });

// *** Ledger Listener Management ***

router.post("/ledger/listener/start", async (ctx) => {
    try {
        await ledgerListener.startListening();
        ctx.body = { 
            success: true, 
            message: "Ledger listener started",
            isActive: ledgerListener.isActive()
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/ledger/listener/stop", async (ctx) => {
    try {
        await ledgerListener.stopListening();
        ctx.body = { 
            success: true, 
            message: "Ledger listener stopped",
            isActive: ledgerListener.isActive()
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.get("/ledger/listener/status", async (ctx) => {
    ctx.body = {
        isActive: ledgerListener.isActive(),
        monitoredAccounts: ledgerListener.getMonitoredAccounts()
    };
});

router.post("/ledger/listener/add_account", async (ctx) => {
    try {
        const { account } = ctx.request.body as { account: string };
        if (!account) {
            ctx.status = 400;
            ctx.body = { success: false, error: "Account address is required" };
            return;
        }
        
        await ledgerListener.addAccount(account);
        ctx.body = { 
            success: true, 
            message: `Started monitoring account: ${account}`,
            monitoredAccounts: ledgerListener.getMonitoredAccounts()
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/ledger/listener/remove_account", async (ctx) => {
    try {
        const { account } = ctx.request.body as { account: string };
        if (!account) {
            ctx.status = 400;
            ctx.body = { success: false, error: "Account address is required" };
            return;
        }
        
        await ledgerListener.removeAccount(account);
        ctx.body = { 
            success: true, 
            message: `Stopped monitoring account: ${account}`,
            monitoredAccounts: ledgerListener.getMonitoredAccounts()
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

// *** Transaction Builder Utilities ***

router.post("/transaction/build/payment", async (ctx) => {
    try {
        const request = ctx.request.body as any;
        const transaction = await TransactionBuilder.buildPayment(request);
        const validation = TransactionBuilder.validateTransaction(transaction);
        
        ctx.body = {
            success: true,
            transaction,
            validation
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/transaction/build/escrow_create", async (ctx) => {
    try {
        const request = ctx.request.body as any;
        const transaction = await TransactionBuilder.buildEscrowCreate(request);
        const validation = TransactionBuilder.validateTransaction(transaction);
        
        ctx.body = {
            success: true,
            transaction,
            validation
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.post("/transaction/validate", async (ctx) => {
    try {
        const transaction = ctx.request.body;
        const validation = TransactionBuilder.validateTransaction(transaction);
        
        ctx.body = {
            success: true,
            validation
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
});

router.get("/", async (ctx) => {
  await ctx.render("index", { title: "XRPL Management Service" });
});

const port = process.env.PORT || 3000;

// Initialize services and start server
const startServer = async () => {
    try {
        // Initialize ledger listener
        await initializeLedgerListener();
        
        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Ledger listener active: ${ledgerListener.isActive()}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

app.use(router.routes());
app.use(router.allowedMethods());

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    try {
        await ledgerListener.stopListening();
        console.log('Ledger listener stopped');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    try {
        await ledgerListener.stopListening();
        console.log('Ledger listener stopped');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Start the server
startServer();
