import { xrplClient } from "../config/clients/xrpl.js";
import { writeResponseToDatabase } from "../data/database.js";
import { 
  SubscribeRequest, 
  UnsubscribeRequest,
  TransactionStream,
  LedgerStream,
  ValidationStream,
  StreamType
} from "xrpl";

export interface LedgerListenerConfig {
  accounts?: string[];
  streams?: StreamType[];
  onTransaction?: (transaction: TransactionStream) => void;
  onLedger?: (ledger: LedgerStream) => void;
  onValidation?: (validation: ValidationStream) => void;
  onError?: (error: Error) => void;
}

export class LedgerListener {
  private isListening: boolean = false;
  private subscribedAccounts: Set<string> = new Set();
  private subscribedStreams: Set<string> = new Set();
  private config: LedgerListenerConfig;

  constructor(config: LedgerListenerConfig = {}) {
    this.config = {
      streams: ['transactions' as StreamType, 'ledger' as StreamType],
      ...config
    };
  }

  /**
   * Start listening to the XRP Ledger for events
   */
  async startListening(): Promise<void> {
    if (!xrplClient) {
      throw new Error("XRPL client not initialized.");
    }

    if (this.isListening) {
      console.warn("Ledger listener is already running.");
      return;
    }

    try {
      // Ensure client is connected
      if (!xrplClient.isConnected()) {
        await xrplClient.connect();
      }

      // Set up event listeners
      this.setupEventListeners();

      // Subscribe to streams and accounts
      await this.subscribe();

      this.isListening = true;
      console.log("Ledger listener started successfully.");
    } catch (error) {
      console.error("Error starting ledger listener:", error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Stop listening to the XRP Ledger
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      console.warn("Ledger listener is not running.");
      return;
    }

    try {
      await this.unsubscribe();
      this.removeEventListeners();
      this.isListening = false;
      console.log("Ledger listener stopped successfully.");
    } catch (error) {
      console.error("Error stopping ledger listener:", error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Add an account to monitor
   */
  async addAccount(account: string): Promise<void> {
    if (!xrplClient) {
      throw new Error("XRPL client not initialized.");
    }

    if (this.subscribedAccounts.has(account)) {
      console.warn(`Account ${account} is already being monitored.`);
      return;
    }

    try {
      const subscribeRequest: SubscribeRequest = {
        command: "subscribe",
        accounts: [account]
      };

      await xrplClient.request(subscribeRequest);
      this.subscribedAccounts.add(account);
      console.log(`Started monitoring account: ${account}`);
    } catch (error) {
      console.error(`Error adding account ${account}:`, error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Remove an account from monitoring
   */
  async removeAccount(account: string): Promise<void> {
    if (!xrplClient) {
      throw new Error("XRPL client not initialized.");
    }

    if (!this.subscribedAccounts.has(account)) {
      console.warn(`Account ${account} is not being monitored.`);
      return;
    }

    try {
      const unsubscribeRequest: UnsubscribeRequest = {
        command: "unsubscribe",
        accounts: [account]
      };

      await xrplClient.request(unsubscribeRequest);
      this.subscribedAccounts.delete(account);
      console.log(`Stopped monitoring account: ${account}`);
    } catch (error) {
      console.error(`Error removing account ${account}:`, error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get the list of currently monitored accounts
   */
  getMonitoredAccounts(): string[] {
    return Array.from(this.subscribedAccounts);
  }

  /**
   * Check if the listener is currently active
   */
  isActive(): boolean {
    return this.isListening;
  }

  private async subscribe(): Promise<void> {
    if (!xrplClient) {
      throw new Error("XRPL client not initialized.");
    }

    const subscribeRequest: SubscribeRequest = {
      command: "subscribe",
      streams: this.config.streams || []
    };

    // Add accounts if provided
    if (this.config.accounts && this.config.accounts.length > 0) {
      subscribeRequest.accounts = this.config.accounts;
      this.config.accounts.forEach(account => this.subscribedAccounts.add(account));
    }

    await xrplClient.request(subscribeRequest);
    
    // Track subscribed streams
    this.config.streams?.forEach(stream => this.subscribedStreams.add(stream));
    
    console.log("Subscribed to ledger streams:", this.config.streams);
    if (this.config.accounts) {
      console.log("Subscribed to accounts:", this.config.accounts);
    }
  }

  private async unsubscribe(): Promise<void> {
    if (!xrplClient) {
      return;
    }

    try {
      const unsubscribeRequest: UnsubscribeRequest = {
        command: "unsubscribe",
        streams: Array.from(this.subscribedStreams) as StreamType[]
      };

      if (this.subscribedAccounts.size > 0) {
        unsubscribeRequest.accounts = Array.from(this.subscribedAccounts);
      }

      await xrplClient.request(unsubscribeRequest);
      
      this.subscribedStreams.clear();
      this.subscribedAccounts.clear();
      
      console.log("Unsubscribed from all streams and accounts.");
    } catch (error) {
      console.error("Error during unsubscribe:", error);
    }
  }

  private setupEventListeners(): void {
    if (!xrplClient) {
      return;
    }

    xrplClient.on('transaction', this.handleTransaction.bind(this));
    xrplClient.on('ledgerClosed', this.handleLedger.bind(this));
    xrplClient.on('validationReceived', this.handleValidation.bind(this));
    xrplClient.on('error', this.handleError.bind(this));
    xrplClient.on('disconnected', this.handleDisconnection.bind(this));
  }

  private removeEventListeners(): void {
    if (!xrplClient) {
      return;
    }

    xrplClient.removeAllListeners('transaction');
    xrplClient.removeAllListeners('ledgerClosed');
    xrplClient.removeAllListeners('validationReceived');
    xrplClient.removeAllListeners('error');
    xrplClient.removeAllListeners('disconnected');
  }

  private async handleTransaction(transaction: TransactionStream): Promise<void> {
    try {
      if (!transaction.transaction) {
        console.warn("Received transaction event without transaction data");
        return;
      }

      console.log(`Transaction received: ${transaction.transaction.hash || 'unknown'}`);
      
      // Validate transaction signature and structure
      if (!this.validateTransaction(transaction)) {
        console.warn(`Invalid transaction received: ${transaction.transaction.hash || 'unknown'}`);
        return;
      }

      // Store transaction in database
      await this.storeTransactionEvent(transaction);

      // Call custom handler if provided
      if (this.config.onTransaction) {
        this.config.onTransaction(transaction);
      }

      // Update transaction status in database if it's related to our tasks
      await this.updateTransactionStatus(transaction);

    } catch (error) {
      console.error("Error handling transaction:", error);
      this.handleError(error as Error);
    }
  }

  private handleLedger(ledger: LedgerStream): void {
    try {
      console.log(`Ledger closed: ${ledger.ledger_index}`);
      
      if (this.config.onLedger) {
        this.config.onLedger(ledger);
      }
    } catch (error) {
      console.error("Error handling ledger event:", error);
      this.handleError(error as Error);
    }
  }

  private handleValidation(validation: ValidationStream): void {
    try {
      console.log(`Validation received for ledger: ${validation.ledger_index}`);
      
      if (this.config.onValidation) {
        this.config.onValidation(validation);
      }
    } catch (error) {
      console.error("Error handling validation event:", error);
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error): void {
    console.error("Ledger listener error:", error);
    
    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  private async handleDisconnection(): Promise<void> {
    console.warn("XRPL client disconnected. Attempting to reconnect...");
    
    try {
      if (xrplClient && !xrplClient.isConnected()) {
        await xrplClient.connect();
        
        // Re-subscribe if we were listening
        if (this.isListening) {
          await this.subscribe();
        }
        
        console.log("Successfully reconnected to XRPL.");
      }
    } catch (error) {
      console.error("Failed to reconnect to XRPL:", error);
      this.handleError(error as Error);
    }
  }

  private validateTransaction(transaction: TransactionStream): boolean {
    // Basic validation - ensure required fields are present
    if (!transaction.transaction) {
      return false;
    }

    // Ensure transaction is validated
    if (!transaction.validated) {
      return false;
    }

    // Additional validation can be added here
    return true;
  }

  private async storeTransactionEvent(transaction: TransactionStream): Promise<void> {
    try {
      if (!transaction.transaction) {
        console.warn("Cannot store transaction event: transaction data is missing");
        return;
      }

      const eventData = {
        hash: (transaction.transaction as any).hash,
        type: (transaction.transaction as any).TransactionType,
        account: (transaction.transaction as any).Account,
        destination: (transaction.transaction as any).Destination,
        amount: (transaction.transaction as any).Amount,
        fee: (transaction.transaction as any).Fee,
        sequence: (transaction.transaction as any).Sequence,
        ledger_index: transaction.ledger_index,
        validated: transaction.validated,
        timestamp: new Date().toISOString(),
        raw_transaction: transaction
      };

      // Store in database using existing database function
      await writeResponseToDatabase(eventData, "ledger_transaction_event", (transaction.transaction as any).hash || "unknown");
      
    } catch (error) {
      console.error("Error storing transaction event:", error);
    }
  }

  private async updateTransactionStatus(transaction: TransactionStream): Promise<void> {
    try {
      if (!transaction.transaction) {
        console.warn("Cannot update transaction status: transaction data is missing");
        return;
      }

      // Check if this transaction is related to any of our tasks
      // This would typically involve checking the transaction memo or custom fields
      // against our database of pending transactions
      
      const txHash = (transaction.transaction as any).hash;
      const isSuccessful = transaction.meta && 
        typeof transaction.meta === 'object' && 
        'TransactionResult' in transaction.meta &&
        transaction.meta.TransactionResult === 'tesSUCCESS';

      // Update transaction status in database
      const statusUpdate = {
        hash: txHash,
        status: isSuccessful ? 'confirmed' : 'failed',
        ledger_index: transaction.ledger_index,
        validated: transaction.validated,
        updated_at: new Date().toISOString()
      };

      await writeResponseToDatabase(statusUpdate, "transaction_status_update", txHash || "unknown");
      
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  }
}

// Export a singleton instance
export const ledgerListener = new LedgerListener();
