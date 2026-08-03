from fastapi import APIRouter, HTTPException, Request, UploadFile, status

from app.core.config import get_settings
from app.ml.preprocess import InvalidImageError
from app.schemas.prediction import ClassPrediction, PredictionResponse

router = APIRouter(tags=["prediction"])

settings = get_settings()


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: Request, file: UploadFile) -> PredictionResponse:
    if file.content_type not in settings.allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Type de fichier non supporté : {file.content_type}. Attendu : JPEG ou PNG.",
        )

    raw_bytes = await file.read()
    if len(raw_bytes) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Fichier trop volumineux (max {settings.max_upload_size_bytes // (1024 * 1024)} Mo).",
        )

    model = request.app.state.model
    try:
        ranked, inference_time_ms = model.predict(raw_bytes)
    except InvalidImageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    top_k = [
        ClassPrediction(label=c.label, species=c.species, condition=c.condition, confidence=conf)
        for c, conf in ranked[: settings.top_k]
    ]

    return PredictionResponse(
        predicted=top_k[0],
        top_k=top_k,
        low_confidence=top_k[0].confidence < settings.confidence_threshold,
        inference_time_ms=inference_time_ms,
        is_placeholder=model.is_placeholder,
    )
