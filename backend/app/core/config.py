from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Configuration centrale de l'API, surchargeable via variables d'environnement ou .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Leaf Disease Detection API"
    api_prefix: str = "/api"

    # Emplacement du modèle entraîné (SavedModel Keras). Tant que ce chemin n'existe
    # pas, l'API démarre quand même en "mode placeholder" (voir app/ml/model.py).
    model_path: Path = BACKEND_DIR / "models" / "leaf_disease_model.keras"

    # Doit correspondre à la résolution attendue par le modèle de base
    # (224x224 pour MobileNetV2 et EfficientNetB0, cf. cahier des charges section 6.1).
    image_size: tuple[int, int] = (224, 224)

    # Sous ce seuil de confiance, le client est invité à afficher le top-3
    # plutôt que la seule classe prédite (cahier des charges section 5).
    confidence_threshold: float = 0.70
    top_k: int = 3

    max_upload_size_bytes: int = 10 * 1024 * 1024  # 10 Mo
    allowed_content_types: tuple[str, ...] = ("image/jpeg", "image/png")

    # Origines autorisées pour le frontend (à ajuster une fois le frontend en place).
    cors_allow_origins: tuple[str, ...] = ("http://localhost:3000", "http://localhost:5173")


@lru_cache
def get_settings() -> Settings:
    return Settings()
