from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from backend.ai.gemini import gemini_service
from backend.engine.adaptive import adaptive_engine
from backend.models.schemas import ChildProfile, ScenarioRequest, ScenarioResponse
from backend.services.firebase import firebase_service

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.post("", response_model=ScenarioResponse)
def generate_scenario(payload: ScenarioRequest) -> ScenarioResponse:
    profile = ChildProfile(
        child_id=payload.child_id,
        age=payload.age,
        interest=payload.interest,
        skill_level=payload.skill_level,
        target_skill=payload.target_skill,
        difficulty=payload.difficulty,
    )

    adaptive_engine.create_child_profile(profile.dict())

    try:
        scenario = gemini_service.generate_scenario(profile, profile.difficulty)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - safety for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate scenario: {exc}",
        ) from exc

    adaptive_engine.store_scenario(scenario)
    if firebase_service.enabled:
        firebase_service.set_document("scenarios", scenario["scenario_id"], scenario)
    return ScenarioResponse(
        scenario_id=scenario["scenario_id"],
        question=scenario["question"],
        context=scenario["context"],
        options=scenario["options"],
        best_answer=scenario["best_answer"],
        explanation=scenario["explanation"],
        difficulty=profile.difficulty,
        target_skill=profile.target_skill,
    )
