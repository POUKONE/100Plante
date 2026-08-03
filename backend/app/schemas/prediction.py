from pydantic import BaseModel, Field


class ClassPrediction(BaseModel):
    label: str = Field(..., description="Identifiant brut de la classe, ex. 'Apple___Apple_scab'")
    species: str = Field(..., description="Espèce, ex. 'Apple'")
    condition: str = Field(..., description="État sanitaire, ex. 'Apple scab' ou 'healthy'")
    confidence: float = Field(..., ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    predicted: ClassPrediction
    top_k: list[ClassPrediction]
    low_confidence: bool = Field(
        ..., description="True si la confiance de la prédiction principale est sous le seuil configuré"
    )
    inference_time_ms: float
    is_placeholder: bool = Field(
        ..., description="True tant qu'aucun modèle entraîné n'est chargé (voir README backend)"
    )


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    is_placeholder: bool
    num_classes: int
