from pydantic import BaseModel
from typing import List

class Bill(BaseModel):
    amount: float
    status: str
    service_type: str

class InsightRequest(BaseModel):
    bills: List[Bill]

class InsightResponse(BaseModel):
    risk_level: str
    suggestions: List[str]
