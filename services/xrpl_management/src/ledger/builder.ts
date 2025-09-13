import { xrpToDrops } from "xrpl";
import { accountService } from "./account.js";

export interface BaseTransactionRequest {
  account: string;
  fee?: string;
  sequence?: number;
  lastLedgerSequence?: number;
  memos?: Array<{
    memo: {
      memoType?: string;
      memoData?: string;
      memoFormat?: string;
    };
  }>;
}

export interface PaymentTransactionRequest extends BaseTransactionRequest {
  destination: string;
  amount: string | number; // XRP amount (will be converted to drops)
  destinationTag?: number;
}

export interface EscrowCreateTransactionRequest extends BaseTransactionRequest {
  destination: string;
  amount: string | number; // XRP amount (will be converted to drops)
  finishAfter?: number; // XRPL timestamp
  cancelAfter?: number; // XRPL timestamp
  condition?: string;
  fulfillment?: string;
  destinationTag?: number;
}

export interface EscrowFinishTransactionRequest extends BaseTransactionRequest {
  owner: string;
  offerSequence: number;
  condition?: string;
  fulfillment?: string;
}

export interface EscrowCancelTransactionRequest extends BaseTransactionRequest {
  owner: string;
  offerSequence: number;
}

export interface TrustSetTransactionRequest extends BaseTransactionRequest {
  limitAmount: {
    currency: string;
    issuer: string;
    value: string;
  };
  qualityIn?: number;
  qualityOut?: number;
}

export class TransactionBuilder {
  private static readonly DEFAULT_FEE = "12";
  private static readonly RIPPLE_EPOCH_OFFSET = 946684800;

  /**
   * Build a Payment transaction
   */
  static async buildPayment(request: PaymentTransactionRequest): Promise<any> {
    const baseTransaction = await this.buildBaseTransaction(request);
    
    return {
      ...baseTransaction,
      TransactionType: "Payment",
      Destination: request.destination,
      Amount: this.convertToDrops(request.amount),
      ...(request.destinationTag && { DestinationTag: request.destinationTag })
    };
  }

  /**
   * Build an EscrowCreate transaction
   */
  static async buildEscrowCreate(request: EscrowCreateTransactionRequest): Promise<any> {
    const baseTransaction = await this.buildBaseTransaction(request);
    
    return {
      ...baseTransaction,
      TransactionType: "EscrowCreate",
      Destination: request.destination,
      Amount: this.convertToDrops(request.amount),
      ...(request.finishAfter && { FinishAfter: request.finishAfter }),
      ...(request.cancelAfter && { CancelAfter: request.cancelAfter }),
      ...(request.condition && { Condition: request.condition }),
      ...(request.fulfillment && { Fulfillment: request.fulfillment }),
      ...(request.destinationTag && { DestinationTag: request.destinationTag })
    };
  }

  /**
   * Build an EscrowFinish transaction
   */
  static async buildEscrowFinish(request: EscrowFinishTransactionRequest): Promise<any> {
    const baseTransaction = await this.buildBaseTransaction(request);
    
    return {
      ...baseTransaction,
      TransactionType: "EscrowFinish",
      Owner: request.owner,
      OfferSequence: request.offerSequence,
      ...(request.condition && { Condition: request.condition }),
      ...(request.fulfillment && { Fulfillment: request.fulfillment })
    };
  }

  /**
   * Build an EscrowCancel transaction
   */
  static async buildEscrowCancel(request: EscrowCancelTransactionRequest): Promise<any> {
    const baseTransaction = await this.buildBaseTransaction(request);
    
    return {
      ...baseTransaction,
      TransactionType: "EscrowCancel",
      Owner: request.owner,
      OfferSequence: request.offerSequence
    };
  }

  /**
   * Build a TrustSet transaction
   */
  static async buildTrustSet(request: TrustSetTransactionRequest): Promise<any> {
    const baseTransaction = await this.buildBaseTransaction(request);
    
    return {
      ...baseTransaction,
      TransactionType: "TrustSet",
      LimitAmount: request.limitAmount,
      ...(request.qualityIn && { QualityIn: request.qualityIn }),
      ...(request.qualityOut && { QualityOut: request.qualityOut })
    };
  }

  /**
   * Build the base transaction fields common to all transaction types
   */
  private static async buildBaseTransaction(request: BaseTransactionRequest): Promise<any> {
    const transaction: any = {
      Account: request.account,
      Fee: request.fee || this.DEFAULT_FEE
    };

    // Add sequence if provided, otherwise fetch from ledger
    if (request.sequence !== undefined) {
      transaction.Sequence = request.sequence;
    } else {
      const accountInfo = await accountService.getAccountInfo(request.account);
      if (accountInfo?.result?.account_data?.Sequence) {
        transaction.Sequence = accountInfo.result.account_data.Sequence;
      }
    }

    // Add LastLedgerSequence if provided
    if (request.lastLedgerSequence) {
      transaction.LastLedgerSequence = request.lastLedgerSequence;
    }

    // Add memos if provided
    if (request.memos && request.memos.length > 0) {
      transaction.Memos = request.memos.map(memo => ({
        Memo: {
          ...(memo.memo.memoType && { MemoType: this.stringToHex(memo.memo.memoType) }),
          ...(memo.memo.memoData && { MemoData: this.stringToHex(memo.memo.memoData) }),
          ...(memo.memo.memoFormat && { MemoFormat: this.stringToHex(memo.memo.memoFormat) })
        }
      }));
    }

    return transaction;
  }

  /**
   * Convert XRP amount to drops (smallest unit)
   */
  private static convertToDrops(amount: string | number): string {
    if (typeof amount === 'string') {
      // If it's already in drops format (all digits), return as is
      if (/^\d+$/.test(amount)) {
        return amount;
      }
      // Otherwise convert from XRP to drops
      return xrpToDrops(amount);
    }
    return xrpToDrops(amount.toString());
  }

  /**
   * Convert string to hex for memo fields
   */
  private static stringToHex(str: string): string {
    return Buffer.from(str, 'utf8').toString('hex').toUpperCase();
  }

  /**
   * Convert Unix timestamp to XRPL timestamp
   */
  static unixToXrplTimestamp(unixTimestamp: number): number {
    return unixTimestamp - this.RIPPLE_EPOCH_OFFSET;
  }

  /**
   * Convert XRPL timestamp to Unix timestamp
   */
  static xrplToUnixTimestamp(xrplTimestamp: number): number {
    return xrplTimestamp + this.RIPPLE_EPOCH_OFFSET;
  }

  /**
   * Generate a timestamp for 10 minutes from now (useful for escrow FinishAfter)
   */
  static generateFutureTimestamp(minutesFromNow: number = 10): number {
    const futureDate = new Date(Date.now() + minutesFromNow * 60000);
    const unixTimestamp = Math.floor(futureDate.getTime() / 1000);
    return this.unixToXrplTimestamp(unixTimestamp);
  }

  /**
   * Generate a cancel after timestamp (24 hours after finish after by default)
   */
  static generateCancelAfterTimestamp(finishAfterTimestamp: number, hoursAfter: number = 24): number {
    const finishAfterUnix = this.xrplToUnixTimestamp(finishAfterTimestamp);
    const cancelAfterUnix = finishAfterUnix + (hoursAfter * 3600);
    return this.unixToXrplTimestamp(cancelAfterUnix);
  }

  /**
   * Validate that a timestamp is in the future
   */
  static isTimestampInFuture(xrplTimestamp: number): boolean {
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    const currentXrplTimestamp = this.unixToXrplTimestamp(currentUnixTimestamp);
    return xrplTimestamp > currentXrplTimestamp;
  }

  /**
   * Create a memo object for task tracking
   */
  static createTaskMemo(taskId: string, functionName: string, userId?: string): Array<{
    memo: {
      memoType?: string;
      memoData?: string;
      memoFormat?: string;
    };
  }> {
    const memoData = JSON.stringify({
      task_id: taskId,
      function: functionName,
      ...(userId && { user_id: userId }),
      timestamp: new Date().toISOString()
    });

    return [{
      memo: {
        memoType: "epictask/transaction",
        memoData: memoData,
        memoFormat: "application/json"
      }
    }];
  }

  /**
   * Validate transaction before submission
   */
  static validateTransaction(transaction: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!transaction.Account) {
      errors.push("Account field is required");
    }

    if (!transaction.TransactionType) {
      errors.push("TransactionType field is required");
    }

    if (!transaction.Fee) {
      errors.push("Fee field is required");
    }

    // Validate specific transaction types
    switch (transaction.TransactionType) {
      case "Payment":
        if (!transaction.Destination) {
          errors.push("Destination is required for Payment transactions");
        }
        if (!transaction.Amount) {
          errors.push("Amount is required for Payment transactions");
        }
        break;

      case "EscrowCreate":
        if (!transaction.Destination) {
          errors.push("Destination is required for EscrowCreate transactions");
        }
        if (!transaction.Amount) {
          errors.push("Amount is required for EscrowCreate transactions");
        }
        break;

      case "EscrowFinish":
        if (!transaction.Owner) {
          errors.push("Owner is required for EscrowFinish transactions");
        }
        if (transaction.OfferSequence === undefined) {
          errors.push("OfferSequence is required for EscrowFinish transactions");
        }
        break;

      case "EscrowCancel":
        if (!transaction.Owner) {
          errors.push("Owner is required for EscrowCancel transactions");
        }
        if (transaction.OfferSequence === undefined) {
          errors.push("OfferSequence is required for EscrowCancel transactions");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
