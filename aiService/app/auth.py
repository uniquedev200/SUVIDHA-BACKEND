from fastapi import Header, HTTPException
import jwt
from .config import SERVICE_JWT_SECRET

def verify_service_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SERVICE_JWT_SECRET, algorithms=["HS256"])
        if payload.get("service") != "SUVIDHA_BACKEND":
            raise HTTPException(status_code=403, detail="Forbidden")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
