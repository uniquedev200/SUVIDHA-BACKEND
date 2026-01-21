import os
from dotenv import load_dotenv

load_dotenv()

SERVICE_JWT_SECRET = os.getenv("SERVICE_JWT_SECRET")
