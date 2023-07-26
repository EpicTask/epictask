from pydantic import BaseModel

class PaymentRequest(BaseModel):
    type = 'Payment'
    amount: int
    source: str
    destination: str
    note: str | None = None
    user_token: str | None = None
    task_id: str | None = None

class CreateEscrowModel(BaseModel):
    destination: str
    amount: float
    account: str
    finish_after: int
    cancel_after: int

class EscrowModel(BaseModel):
    owner: str
    wallet: str
    offer_sequence: str