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
    account: str
    amount: float
    cancel_after: int | None = None
    destination: str
    finish_after: int | None = None


class EscrowModel(BaseModel):
    offer_sequence: str
    owner: str
    wallet: str
