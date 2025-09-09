import sdk from "@crossmarkio/sdk";
import { TransactionBuilder } from "../../../ledger/builder";
import { writeResponseToDatabase } from "../../../data/database";
import { PaymentRequest, CreateEscrowModel, EscrowModel } from "../../../typings/models";

const crossmark = sdk;

export interface CrossmarkResponse {
  success: boolean;
  data?: any;
  error?: string;
  hash?: string;
}

export class CrossmarkService {
  /**
   * Sign in with Crossmark wallet
   */
  async signIn(): Promise<CrossmarkResponse> {
    try {
      const response = await crossmark.methods.signInAndWait();
      
      if (response.response.data.address) {
        return {
          success: true,
          data: {
            address: response.response.data.address,
            publicKey: response.response.data.publicKey
          }
        };
      }
      
      return {
        success: false,
        error: "Failed to get address from Crossmark response"
      };
    } catch (error) {
      console.error("Crossmark sign in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during sign in"
      };
    }
  }

  /**
   * Handle payment request through Crossmark
   */
  async handlePaymentRequest(paymentRequest: PaymentRequest): Promise<CrossmarkResponse> {
    try {
      // Build transaction using the centralized builder
      const transaction = await TransactionBuilder.buildPayment({
        account: paymentRequest.source,
        destination: paymentRequest.destination,
        amount: paymentRequest.amount,
        memos: paymentRequest.task_id ? 
          TransactionBuilder.createTaskMemo(paymentRequest.task_id, "payment_request") : 
          undefined
      });

      // Validate transaction
      const validation = TransactionBuilder.validateTransaction(transaction);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Transaction validation failed: ${validation.errors.join(", ")}`
        };
      }

      // Sign and submit with Crossmark
      const response = await crossmark.async.signAndSubmitAndWait(transaction);
      
      if (response.response.data.resp) {
        const result = {
          success: true,
          data: response.response.data,
          hash: (response.response.data.resp as any)?.hash || response.response.data.resp
        };

        // Store response in database
        if (paymentRequest.task_id) {
          await writeResponseToDatabase(result, "crossmark_payment_request", paymentRequest.task_id);
        }

        return result;
      }

      return {
        success: false,
        error: "No response data received from Crossmark"
      };
    } catch (error) {
      console.error("Crossmark payment error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during payment"
      };
    }
  }

  /**
   * Create escrow through Crossmark
   */
  async createEscrow(escrowRequest: CreateEscrowModel): Promise<CrossmarkResponse> {
    try {
      // Generate timestamps if not provided
      const finishAfter = escrowRequest.finish_after || 
        TransactionBuilder.generateFutureTimestamp(10);
      const cancelAfter = escrowRequest.cancel_after || 
        TransactionBuilder.generateCancelAfterTimestamp(finishAfter);

      // Build transaction using the centralized builder
      const transaction = await TransactionBuilder.buildEscrowCreate({
        account: escrowRequest.account,
        destination: escrowRequest.destination,
        amount: escrowRequest.amount,
        finishAfter: finishAfter,
        cancelAfter: cancelAfter,
        memos: escrowRequest.task_id ? 
          TransactionBuilder.createTaskMemo(
            escrowRequest.task_id, 
            "create_escrow_crossmark", 
            escrowRequest.user_id
          ) : undefined
      });

      // Validate transaction
      const validation = TransactionBuilder.validateTransaction(transaction);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Transaction validation failed: ${validation.errors.join(", ")}`
        };
      }

      // Sign and submit with Crossmark
      const response = await crossmark.async.signAndSubmitAndWait(transaction);
      
      if (response.response.data.resp) {
        const result = {
          success: true,
          data: response.response.data,
          hash: (response.response.data.resp as any)?.hash || response.response.data.resp
        };

        // Store response in database
        if (escrowRequest.task_id) {
          await writeResponseToDatabase(result, "crossmark_create_escrow", escrowRequest.task_id);
        }

        return result;
      }

      return {
        success: false,
        error: "No response data received from Crossmark"
      };
    } catch (error) {
      console.error("Crossmark escrow creation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during escrow creation"
      };
    }
  }

  /**
   * Finish escrow through Crossmark
   */
  async finishEscrow(escrowRequest: EscrowModel): Promise<CrossmarkResponse> {
    try {
      // Build transaction using the centralized builder
      const transaction = await TransactionBuilder.buildEscrowFinish({
        account: escrowRequest.account,
        owner: escrowRequest.owner,
        offerSequence: parseInt(escrowRequest.offer_sequence),
        memos: escrowRequest.task_id ? 
          TransactionBuilder.createTaskMemo(
            escrowRequest.task_id, 
            "finish_escrow_crossmark", 
            escrowRequest.user_id || undefined
          ) : undefined
      });

      // Validate transaction
      const validation = TransactionBuilder.validateTransaction(transaction);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Transaction validation failed: ${validation.errors.join(", ")}`
        };
      }

      // Sign and submit with Crossmark
      const response = await crossmark.async.signAndSubmitAndWait(transaction);
      
      if (response.response.data.resp) {
        const result = {
          success: true,
          data: response.response.data,
          hash: (response.response.data.resp as any)?.hash || response.response.data.resp
        };

        // Store response in database
        if (escrowRequest.task_id) {
          await writeResponseToDatabase(result, "crossmark_finish_escrow", escrowRequest.task_id);
        }

        return result;
      }

      return {
        success: false,
        error: "No response data received from Crossmark"
      };
    } catch (error) {
      console.error("Crossmark escrow finish error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during escrow finish"
      };
    }
  }

  /**
   * Cancel escrow through Crossmark
   */
  async cancelEscrow(escrowRequest: EscrowModel): Promise<CrossmarkResponse> {
    try {
      // Build transaction using the centralized builder
      const transaction = await TransactionBuilder.buildEscrowCancel({
        account: escrowRequest.account,
        owner: escrowRequest.owner,
        offerSequence: parseInt(escrowRequest.offer_sequence),
        memos: escrowRequest.task_id ? 
          TransactionBuilder.createTaskMemo(
            escrowRequest.task_id, 
            "cancel_escrow_crossmark", 
            escrowRequest.user_id || undefined
          ) : undefined
      });

      // Validate transaction
      const validation = TransactionBuilder.validateTransaction(transaction);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Transaction validation failed: ${validation.errors.join(", ")}`
        };
      }

      // Sign and submit with Crossmark
      const response = await crossmark.async.signAndSubmitAndWait(transaction);
      
      if (response.response.data.resp) {
        const result = {
          success: true,
          data: response.response.data,
          hash: (response.response.data.resp as any)?.hash || response.response.data.resp
        };

        // Store response in database
        if (escrowRequest.task_id) {
          await writeResponseToDatabase(result, "crossmark_cancel_escrow", escrowRequest.task_id);
        }

        return result;
      }

      return {
        success: false,
        error: "No response data received from Crossmark"
      };
    } catch (error) {
      console.error("Crossmark escrow cancel error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during escrow cancel"
      };
    }
  }

  /**
   * Sign a transaction without submitting (for advanced use cases)
   */
  async signTransaction(transaction: any): Promise<CrossmarkResponse> {
    try {
      // Validate transaction first
      const validation = TransactionBuilder.validateTransaction(transaction);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Transaction validation failed: ${validation.errors.join(", ")}`
        };
      }

      const response = await crossmark.async.signAndWait(transaction);
      
      if (response.response.data) {
        return {
          success: true,
          data: response.response.data
        };
      }

      return {
        success: false,
        error: "No response data received from Crossmark"
      };
    } catch (error) {
      console.error("Crossmark sign transaction error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during transaction signing"
      };
    }
  }

  /**
   * Check if Crossmark is available in the browser
   */
  isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 
             typeof (window as any).crossmark !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Get Crossmark version information
   */
  async getVersion(): Promise<CrossmarkResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: "Crossmark is not available"
        };
      }

      // This would depend on Crossmark SDK providing version info
      return {
        success: true,
        data: {
          available: true,
          // version: await crossmark.getVersion() // if available
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting version"
      };
    }
  }
}

// Export singleton instance
export const crossmarkService = new CrossmarkService();

// Export legacy functions for backward compatibility
export const signIn = () => crossmarkService.signIn();
export const signAndSubmitTransaction = (tx: any) => crossmarkService.signTransaction(tx);
