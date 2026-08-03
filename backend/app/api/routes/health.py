from fastapi import APIRouter, Request

from app.ml.labels import NUM_CLASSES
from app.schemas.prediction import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health(request: Request) -> HealthResponse:
    model = request.app.state.model
    return HealthResponse(
        status="ok",
        model_loaded=not model.is_placeholder,
        is_placeholder=model.is_placeholder,
        num_classes=NUM_CLASSES,
    )
