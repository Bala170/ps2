from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


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


class ResponseSubmission(BaseModel):
    child_id: str
    scenario_id: str
    selected_answer: str = Field(..., min_length=1, max_length=10)


class ScenarioResponse(BaseModel):
    scenario_id: str
    question: str
    context: str
    options: dict[str, str]
    best_answer: str
    explanation: str
    difficulty: int
    target_skill: str


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
