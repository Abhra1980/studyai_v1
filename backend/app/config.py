"""Application configuration loaded from .env file."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All settings are loaded from the root .env file."""

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── LLM Provider ──────────────────────────────────────────────
    LLM_PROVIDER: str = "ollama"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "gpt-oss:120b-cloud"
    OPENAI_API_KEY: str = ""
    OLLAMA_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral"

    # ── LangSmith ─────────────────────────────────────────────────
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_PROJECT: str = "education_app"

    # ── Database (Neon Serverless Postgres) ────────────────────────
    neon_db_api_key: str = ""

    @property
    def DATABASE_URL(self) -> str:
        """Return async-compatible connection string for Neon."""
        url = self.neon_db_api_key
        # Replace postgres:// or postgresql:// with postgresql+asyncpg://
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        # Remove params not supported by asyncpg; use ssl=true for asyncpg
        for param in ("channel_binding=require", "sslmode=require"):
            url = url.replace(f"&{param}", "")
            url = url.replace(f"?{param}&", "?")
            url = url.replace(f"?{param}", "")
        # Clean up trailing ? if all params were stripped
        url = url.rstrip("?")
        # Ensure ssl=true for Neon (asyncpg format)
        if "ssl=" not in url:
            url = url + ("&" if "?" in url else "?") + "ssl=true"
        return url

    @property
    def LLM_API_KEY(self) -> str:
        if self.LLM_PROVIDER == "openrouter":
            return self.OPENROUTER_API_KEY
        return self.OPENAI_API_KEY

    @property
    def LLM_BASE_URL(self) -> str | None:
        if self.LLM_PROVIDER == "openrouter":
            return "https://openrouter.ai/api/v1"
        elif self.LLM_PROVIDER == "ollama":
            # Ollama uses OpenAI-compatible API at /v1 endpoint
            base = self.OLLAMA_BASE_URL.rstrip("/")
            return f"{base}/v1" 
        return None

    @property
    def LLM_MODEL(self) -> str:
        if self.LLM_PROVIDER == "openrouter":
            return self.OPENROUTER_MODEL
        elif self.LLM_PROVIDER == "ollama":
            return self.OLLAMA_MODEL
        return "gpt-4o"

    # ── App ────────────────────────────────────────────────────────
    APP_NAME: str = "StudyAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── CSV Data Path ─────────────────────────────────────────────
    CSV_PATH: str = ""  # Optional override (e.g. /app/AI_ML_Syllabus_Structured.csv in Docker)

    @property
    def CSV_PATH_RESOLVED(self) -> str:
        """Resolved CSV path: env CSV_PATH, or default for Docker/development."""
        if self.CSV_PATH:
            return self.CSV_PATH
        return str(
            Path(__file__).resolve().parents[2] / "AI_ML_Syllabus_Structured.csv"
        )


settings = Settings()
