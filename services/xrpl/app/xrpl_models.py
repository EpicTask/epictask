from pydantic import BaseModel

class PaymentRequest(BaseModel):
    type: str
    amount: int
    source: str
    destination: str
    note: str
