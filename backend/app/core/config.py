import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "SPACE LEGACY: The Forgotten Explorers"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data/space_legacy.db"
    SEED_DATA_PATH: str = str(BASE_DIR / "data" / "seed_data.json")
    DOCUMENTS_DIR: str = str(BASE_DIR / "data" / "documents")
    CHROMA_PERSIST_DIR: str = str(BASE_DIR / "chroma_storage")

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    # Multilingual sentence-transformer with Arabic and English support.
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    # Chroma's default L2 distance. Tune with a labeled evaluation set before tightening.
    RAG_MAX_DISTANCE: float = 1.25

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://space-legacy.vercel.app",
    ]

    class Config:
        case_sensitive = True
        env_file = str(BASE_DIR.parent / ".env")
        extra = "allow"


settings = Settings()
