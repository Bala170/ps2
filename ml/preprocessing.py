from __future__ import annotations

from pathlib import Path
from typing import Any, Iterable

import pandas as pd

FEATURE_COLUMNS = [
    "communication_score",
    "social_interaction_score",
    "empathy_score",
    "emotion_recognition_score",
    "response_accuracy",
    "average_response_time",
    "mistake_rate",
    "repeated_mistakes",
    "improvement_rate",
    "completed_sessions",
    "difficulty_level",
]
TARGET_COLUMN = "recommended_support_area"
SUPPORT_AREAS = [
    "Speech & Communication Support",
    "Social Skills Support",
    "Emotional/Social Understanding Support",
    "Behavioral/Functional Skills Support",
]
RANGES = {
    "communication_score": (0, 100),
    "social_interaction_score": (0, 100),
    "empathy_score": (0, 100),
    "emotion_recognition_score": (0, 100),
    "response_accuracy": (0, 100),
    "average_response_time": (0, 180),
    "mistake_rate": (0, 1),
    "repeated_mistakes": (0, 20),
    "improvement_rate": (-1, 1),
    "completed_sessions": (0, 1000),
    "difficulty_level": (1, 3),
}


def validate_dataset(frame: pd.DataFrame) -> pd.DataFrame:
    required = FEATURE_COLUMNS + [TARGET_COLUMN]
    missing = sorted(set(required) - set(frame.columns))
    if missing:
        raise ValueError(f"Dataset is missing columns: {missing}")
    cleaned = frame[required].copy()
    if cleaned.isna().any().any():
        raise ValueError("Dataset contains missing values.")
    for column, (low, high) in RANGES.items():
        values = pd.to_numeric(cleaned[column], errors="coerce")
        if values.isna().any() or ((values < low) | (values > high)).any():
            raise ValueError(f"Invalid range in {column}; expected {low} to {high}.")
        cleaned[column] = values
    invalid_labels = sorted(set(cleaned[TARGET_COLUMN]) - set(SUPPORT_AREAS))
    if invalid_labels:
        raise ValueError(f"Unknown support area labels: {invalid_labels}")
    return cleaned


def load_dataset(path: str | Path) -> pd.DataFrame:
    return validate_dataset(pd.read_csv(path))


def _mean(values: Iterable[float], default: float = 0.0) -> float:
    values = list(values)
    return sum(values) / len(values) if values else default


def extract_features(attempts: list[dict[str, Any]], profile: dict[str, Any] | None = None) -> dict[str, float]:
    """Aggregate recent non-video learning attempts into the model feature contract."""
    recent = attempts[-20:]
    scores = [float(item.get("score", 0)) * 100 for item in recent]
    skills = [str(item.get("skill", "")).lower() for item in recent]
    average = _mean(scores)
    previous = _mean(scores[:-max(1, len(scores) // 3)]) if len(scores) > 1 else average
    trend = max(-1.0, min(1.0, (average - previous) / 100))
    mistakes = [score < 50 for score in scores]
    repeated = sum(1 for first, second in zip(mistakes, mistakes[1:]) if first and second)
    communication = _mean([score for score, skill in zip(scores, skills) if any(word in skill for word in ("help", "feel", "communication"))], average)
    social = _mean([score for score, skill in zip(scores, skills) if any(word in skill for word in ("friend", "sharing"))], average)
    emotional = _mean([score for score, skill in zip(scores, skills) if any(word in skill for word in ("feel", "empathy", "emotion"))], average)
    functional = _mean([score for score, skill in zip(scores, skills) if any(word in skill for word in ("patient", "routine", "turn"))], average)
    difficulty = float((profile or {}).get("difficulty", 1))
    return {
        "communication_score": round(communication, 2),
        "social_interaction_score": round(social, 2),
        "empathy_score": round(emotional, 2),
        "emotion_recognition_score": round(emotional, 2),
        "response_accuracy": round(average, 2),
        "average_response_time": 30.0,
        "mistake_rate": round(sum(mistakes) / len(mistakes), 4) if mistakes else 0.0,
        "repeated_mistakes": float(repeated),
        "improvement_rate": round(trend, 4),
        "completed_sessions": float(len(recent)),
        "difficulty_level": difficulty,
    }
