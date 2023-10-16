from pydantic import BaseModel
from typing import Dict, List

class PaymentRequest(BaseModel):
    type = 'Payment'
    amount: int
    source: str
    destination: str
    note: str | None = None
    user_token: str | None = None
    task_id: str | None = None


class CreateEscrowModel(BaseModel):
    account: str
    amount: float
    cancel_after: int | None = None
    destination: str
    finish_after: int | None = None
    task_id: str
    user_id: str
    user_token: str | None = None


class EscrowModel(BaseModel):
    account: str
    offer_sequence: str
    owner: str
    task_id: str | None = None
    user_id: str | None = None
    user_token: str | None = None

# From xrpscan
class AccountInfo(BaseModel):
    sequence: int
    xrpBalance: str
    ownerCount: int
    previousAffectingTransactionID: str
    previousAffectingTransactionLedgerVersion: int
    Account: str
    Balance: str
    Flags: int
    LedgerEntryType: str
    OwnerCount: int
    PreviousTxnID: str
    PreviousTxnLgrSeq: int
    Sequence: int
    index: str
    settings: Dict[str, str]
    account: str
    parent: str
    initial_balance: float
    inception: str
    ledger_index: int
    tx_hash: str
    accountName: Dict[str, str]
    parentName: Dict[str, str]

class DeliveredAmount(BaseModel):
    value: int
    currency: str
    
class Meta(BaseModel):
    TransactionIndex: int
    TransactionResult: str
    delivered_amount: DeliveredAmount

class AccountName(BaseModel):
    name: str
    desc: str
    account: str
    domain: str
    twitter: str
    verified: bool

class DestinationName(BaseModel):
    name: str
    desc: str
    account: str
    domain: str
    twitter: str
    verified: bool

class Transaction(BaseModel):
    meta: Meta
    validated: bool
    Account: str
    Amount: DeliveredAmount
    Destination: str
    DestinationTag: int
    Fee: str
    Flags: int
    LastLedgerSequence: int
    Sequence: int
    SigningPubKey: str
    TransactionType: str
    TxnSignature: str
    hash: str
    ledger_index: int
    date: str
    AccountName: AccountName
    DestinationName: DestinationName

class AccountHeader(BaseModel):
    account: str
    ledger_index_min: int
    ledger_index_max: int
    transactions: List[Transaction]
    validated: bool
    marker: str
    limit: int