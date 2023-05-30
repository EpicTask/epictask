from pydantic import BaseModel

class PaymentRequest(BaseModel):
    type = 'Payment'
    amount: int
    source: str
    destination: str
    note: str | None = None
    user_token: str | None = None

