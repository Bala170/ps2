from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from backend.engine.adaptive import adaptive_engine
from backend.models.schemas import TherapistRecommendationResponse
from backend.services.firebase import firebase_service
from ml.predict import predict_support_area
from ml.preprocessing import extract_features

router = APIRouter(prefix="/children", tags=["therapist-recommendation"])
DISCLAIMER = "This is an educational support recommendation, not a medical diagnosis or clinical assessment. Consider consulting a qualified professional."


def _reason(area: str, features: dict[str, float]) -> str:
    mapping = {
        "Speech & Communication Support": ("communication_score", "Communication performance is the main learning indicator to practise next."),
        "Social Skills Support": ("social_interaction_score", "Social interaction performance is the main learning indicator to practise next."),
        "Emotional/Social Understanding Support": ("emotion_recognition_score", "Emotion and empathy indicators are the main learning area to practise next."),
        "Behavioral/Functional Skills Support": ("mistake_rate", "Repeated mistakes and task consistency are the main indicators to practise next."),
    }
    feature, message = mapping.get(area, ("response_accuracy", "Recent learning indicators suggest a focused support activity."))
    return f"{message} Current indicator: {features.get(feature, 0):.1f}."


@router.get("/{child_id}/therapist-recommendation", response_model=TherapistRecommendationResponse)
def get_therapist_recommendation(child_id: str) -> TherapistRecommendationResponse:
    profile = adaptive_engine.get_child_profile(child_id) or {}
    attempts = adaptive_engine.get_attempts_for_child(child_id)
    if not attempts and firebase_service.enabled:
        try:
            attempts = firebase_service.list_documents("attempts", "child_id", child_id)
        except Exception:
            attempts = []
    try:
        features = extract_features(attempts, profile)
        prediction = predict_support_area(features)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Therapist recommendation model is not trained yet.") from exc
    area = prediction["recommended_support_area"]
    return TherapistRecommendationResponse(
        child_id=child_id,
        recommended_support_area=area,
        confidence=prediction["confidence"],
        key_indicators={
            "communication_score": features["communication_score"],
            "social_interaction_score": features["social_interaction_score"],
            "empathy_score": features["empathy_score"],
            "emotion_recognition_score": features["emotion_recognition_score"],
            "response_accuracy": features["response_accuracy"],
            "improvement_rate": features["improvement_rate"],
            "mistake_rate": features["mistake_rate"],
        },
        reason=_reason(area, features),
        disclaimer=DISCLAIMER,
    )