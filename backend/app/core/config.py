from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # ── App ──────────────────────────────────────────────────────────
    APP_NAME: str = "CaloriX"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # ── Database ─────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./calorixx.db"

    # ── JWT / Auth ───────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION-USE-OPENSSL-RAND-HEX-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # ── AI / LLM ──────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    REQUIRE_AI_AUTH: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()

settings = get_settings()
