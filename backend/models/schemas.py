from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ScenarioHotspot(BaseModel):
    id: str
    label: str
    x: float = Field(..., ge=0, le=100)
    y: float = Field(..., ge=0, le=100)
    radius: float = Field(..., ge=4, le=20)
    meaning: str


class ChildProfile(BaseModel):
    child_id: str | None = None
    age: int = Field(..., ge=3, le=18)
    interest: str = Field(..., min_length=2, max_length=80)
    skill_level: int = Field(..., ge=1, le=5)
    target_skill: str = Field(..., min_length=2, max_length=80)
    difficulty: int = Field(default=1, ge=1, le=3)


class ScenarioRequest(BaseModel):
    child_id: str
    age: int = Field(..., ge=3, le=18)
    interest: str = Field(..., min_length=2, max_length=80)
    skill_level: int = Field(..., ge=1, le=5)
    target_skill: str = Field(..., min_length=2, max_length=80)
    difficulty: int = Field(default=1, ge=1, le=3)
    language: str = Field(default="en", min_length=2, max_length=10)


class ResponseSubmission(BaseModel):
    child_id: str
    scenario_id: str
    selected_answer: str = Field(..., min_length=1, max_length=10)


class SessionStartRequest(BaseModel):
    child_id: str = Field(..., min_length=1, max_length=100)
    scenario_id: str = Field(..., min_length=1, max_length=120)
    skill: str = Field(..., min_length=1, max_length=80)
    difficulty: int = Field(..., ge=1, le=3)
    recording_enabled: bool = False


class SessionCompleteRequest(BaseModel):
    score: float = Field(..., ge=0, le=100)


class LearningSession(BaseModel):
    session_id: str
    child_id: str
    scenario_id: str
    skill: str
    difficulty: int
    score: float | None = None
    recording_enabled: bool
    video_storage_path: str | None = None
    video_url: str | None = None
    started_at: str
    completed_at: str | None = None


class ScenarioResponse(BaseModel):
    scenario_id: str
    question: str
    context: str
    options: dict[str, str]
    best_answer: str
    explanation: str
    difficulty: int
    target_skill: str
    image_url: str | None = None
    image_alt: str | None = None
    hotspots: list[ScenarioHotspot] = Field(default_factory=list)


class ProgressSummary(BaseModel):
    child_id: str
    attempts: int
    average_score: float
    skill_performance: dict[str, float]


class NextActivityRecommendation(BaseModel):
    child_id: str
    skill: str
    difficulty: Literal[1, 2, 3]
    recommendation: str
    reason: str
    current_score: float = 0
    activity: str
    caregiver_tip: str
    source: str = "Therapist-informed guidance"


class TherapistRecommendationResponse(BaseModel):
    child_id: str
    recommended_support_area: str
    confidence: float
    key_indicators: dict[str, float]
    reason: str
    disclaimer: str
