interface PaymentRequest {
    type: string;
    amount: number;
    source: string;
    destination: string;
    note?: string | null;
    user_token?: string | null;
    task_id?: string | null;
}

interface XChainPaymentRequest extends PaymentRequest {}

interface CreateEscrowModel {
    account: string;
    amount: number;
    cancel_after?: number | null;
    destination: string;
    finish_after?: number | null;
    task_id: string;
    user_id: string;
    user_token?: string | null;
}

interface EscrowModel {
    account: string;
    offer_sequence: string;
    owner: string;
    task_id?: string | null;
    user_id?: string | null;
    user_token?: string | null;
}

interface AccountInfo {
    sequence: number;
    xrpBalance: string;
    ownerCount: number;
    previousAffectingTransactionID: string;
    previousAffectingTransactionLedgerVersion: number;
    Account: string;
    Balance: string;
    Flags: number;
    LedgerEntryType: string;
    OwnerCount: number;
    PreviousTxnID: string;
    PreviousTxnLgrSeq: number;
    Sequence: number;
    index: string;
    settings: { [key: string]: string };
    account: string;
    parent: string;
    initial_balance: number;
    inception: string;
    ledger_index: number;
    tx_hash: string;
    accountName: { [key: string]: string };
    parentName: { [key: string]: string };
}

interface DeliveredAmount {
    value: number;
    currency: string;
}

interface Meta {
    TransactionIndex: number;
    TransactionResult: string;
    delivered_amount: DeliveredAmount;
}

interface AccountName {
    name: string;
    desc: string;
    account: string;
    domain: string;
    twitter: string;
    verified: boolean;
}

interface DestinationName extends AccountName {}

interface Transaction {
    meta: Meta;
    validated: boolean;
    Account: string;
    Amount: DeliveredAmount;
    Destination: string;
    DestinationTag: number;
    Fee: string;
    Flags: number;
    LastLedgerSequence: number;
    Sequence: number;
    SigningPubKey: string;
    TransactionType: string;
    TxnSignature: string;
    hash: string;
    ledger_index: number;
    date: string;
    AccountName: AccountName;
    DestinationName: DestinationName;
}

interface AccountHeader {
    account: string;
    ledger_index_min: number;
    ledger_index_max: number;
    transactions: Transaction[];
    validated: boolean;
    marker: string;
    limit: number;
}
