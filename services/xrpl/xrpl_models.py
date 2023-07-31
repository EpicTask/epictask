from pydantic import BaseModel
from typing import Dict

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


class EscrowModel(BaseModel):
    offer_sequence: str
    owner: str
    wallet: str

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