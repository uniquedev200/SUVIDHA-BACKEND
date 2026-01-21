from fastapi import FastAPI, Depends
from .auth import verify_service_token
from .schemas import InsightRequest, InsightResponse
from .models import generate_insights

app = FastAPI(title="SUVIDHA AI Service")

@app.post("/insights", response_model=InsightResponse)
def get_insights(
    data: InsightRequest,
    _ = Depends(verify_service_token)
):
    return generate_insights(data.bills)
