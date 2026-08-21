from __future__ import annotations

from pathlib import Path

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

    scenario["image_url"] = None
    try:
        image_bytes = gemini_service.generate_image(scenario["image_prompt"])
        try:
            scenario["image_url"] = firebase_service.upload_image(
                image_bytes, f"scenarios/{scenario['scenario_id']}.png"
            )
        except Exception:
            media_dir = Path(__file__).resolve().parents[2] / "media" / "scenarios"
            media_dir.mkdir(parents=True, exist_ok=True)
            image_path = media_dir / f"{scenario['scenario_id']}.png"
            image_path.write_bytes(image_bytes)
            scenario["image_url"] = f"/media/scenarios/{image_path.name}"
    except HTTPException:
        scenario["image_alt"] = f"Image unavailable. {scenario.get('image_alt', '')}".strip()

    adaptive_engine.store_scenario(scenario)
    if firebase_service.enabled:
        try:
            firebase_service.set_document("scenarios", scenario["scenario_id"], scenario)
        except Exception:
            pass
    return ScenarioResponse(
        scenario_id=scenario["scenario_id"],
        question=scenario["question"],
        context=scenario["context"],
        options=scenario["options"],
        best_answer=scenario["best_answer"],
        explanation=scenario["explanation"],
        difficulty=profile.difficulty,
        target_skill=profile.target_skill,
        image_url=scenario.get("image_url"),
        image_alt=scenario.get("image_alt"),
        hotspots=scenario.get("hotspots", []),
    )
