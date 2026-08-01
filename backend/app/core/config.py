import os

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tinnicare-super-secret-key-for-hackathon-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
