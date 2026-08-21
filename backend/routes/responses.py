from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from backend.engine.adaptive import adaptive_engine
from backend.models.schemas import ResponseSubmission
from backend.services.firebase import firebase_service

router = APIRouter(prefix="/responses", tags=["responses"])


@router.post("/submit")
def submit_response(payload: ResponseSubmission) -> dict:
    scenario = adaptive_engine.get_scenario(payload.scenario_id)
    if not scenario and firebase_service.enabled:
        scenario = firebase_service.get_document("scenarios", payload.scenario_id)
        if scenario:
            adaptive_engine.store_scenario(scenario)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found.",
        )

    selected = payload.selected_answer.strip().upper()
    correct = selected == scenario["best_answer"].upper()
    score = 1.0 if correct else 0.0

    result = {
        "child_id": payload.child_id,
        "scenario_id": payload.scenario_id,
        "selected_answer": payload.selected_answer,
        "correct": correct,
        "score": score,
        "performance": adaptive_engine.calculate_performance(score),
    }

    attempt = adaptive_engine.record_attempt(
        payload.child_id,
        payload.scenario_id,
        score,
        scenario.get("target_skill", "general"),
    )
    if firebase_service.enabled:
        firebase_service.add_document("attempts", attempt)
    return result
