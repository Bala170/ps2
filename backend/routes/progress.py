from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from backend.engine.adaptive import adaptive_engine
from backend.models.schemas import ChildProfile, NextActivityRecommendation, ProgressSummary
from backend.services.firebase import firebase_service

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/profile/{child_id}", response_model=ChildProfile)
def get_child_profile(child_id: str) -> ChildProfile:
    profile = adaptive_engine.get_child_profile(child_id)
    if not profile and firebase_service.enabled:
        profile = firebase_service.get_document("children", child_id)
        if profile:
            adaptive_engine.create_child_profile(profile)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found.")
    return ChildProfile(**profile)


@router.post("/profile", response_model=ChildProfile)
def create_child_profile(payload: ChildProfile) -> ChildProfile:
    profile = adaptive_engine.create_child_profile(payload.dict())
    if firebase_service.enabled:
        try:
            firebase_service.set_document("children", profile["child_id"], profile)
        except Exception:
            # Local adaptive progress remains available when Firestore is not provisioned.
            pass
    return ChildProfile(**profile)


@router.get("/child/{child_id}", response_model=ProgressSummary)
def get_child_progress(child_id: str) -> ProgressSummary:
    attempts = adaptive_engine.get_attempts_for_child(child_id)
    if not attempts and firebase_service.enabled:
        attempts = firebase_service.list_documents("attempts", "child_id", child_id)
    skill_performance = adaptive_engine.get_skill_performance(child_id)
    if attempts and not adaptive_engine.get_attempts_for_child(child_id):
        for attempt in attempts:
            adaptive_engine.attempts[child_id].append(attempt)
        skill_performance = adaptive_engine.get_skill_performance(child_id)
    avg_score = adaptive_engine.get_average_score(child_id)

    return ProgressSummary(
        child_id=child_id,
        attempts=len(attempts),
        average_score=avg_score,
        skill_performance=skill_performance,
    )


@router.get("/recommendation/{child_id}", response_model=NextActivityRecommendation)
def get_recommended_activity(child_id: str) -> NextActivityRecommendation:
    recommendation = adaptive_engine.recommend_next_activity(child_id)
    return NextActivityRecommendation(**recommendation)
