import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///../database/brain_tumor.db"
    JWT_SECRET: str = "change_me_to_something_very_secret_and_long_neuroscan_9821"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    AI_MODE: str = "demo"
    CLASSIFIER_MODEL_PATH: str = "../models/brain_tumor_classifier.pth"
    SEGMENTATION_MODEL_PATH: str = "../models/brain_tumor_unet.pth"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
