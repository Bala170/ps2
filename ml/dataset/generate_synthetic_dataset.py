from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from preprocessing import SUPPORT_AREAS

FEATURE_COLUMNS = [
    "communication_score", "social_interaction_score", "empathy_score",
    "emotion_recognition_score", "response_accuracy", "average_response_time",
    "mistake_rate", "repeated_mistakes", "improvement_rate",
    "completed_sessions", "difficulty_level",
]


def generate(rows: int = 500, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    records: list[dict[str, float | str]] = []
    for _ in range(rows):
        scores = rng.uniform(25, 92, 4)
        response_accuracy = float(np.clip(np.mean(scores) + rng.normal(0, 7), 10, 98))
        response_time = float(np.clip(rng.normal(38 + (65 - response_accuracy) * 0.35, 12), 8, 150))
        mistake_rate = float(np.clip(1 - response_accuracy / 100 + rng.normal(0, 0.06), 0.03, 0.9))
        repeated = int(np.clip(round(mistake_rate * 14 + rng.normal(0, 2)), 0, 20))
        improvement = float(np.clip(rng.normal(0.04 + (response_accuracy - 55) / 900, 0.07), -0.35, 0.35))
        sessions = int(rng.integers(3, 31))
        difficulty = int(rng.integers(1, 4))

        # Label is a transparent educational mapping: the lowest domain indicator
        # receives the corresponding support area, with a little noise for realism.
        weakest = int(np.argmin(scores))
        if rng.random() < 0.08:
            weakest = int(rng.integers(0, 4))
        label = SUPPORT_AREAS[weakest]
        records.append({
            "communication_score": round(float(scores[0]), 2),
            "social_interaction_score": round(float(scores[1]), 2),
            "empathy_score": round(float(scores[2]), 2),
            "emotion_recognition_score": round(float(scores[3]), 2),
            "response_accuracy": round(response_accuracy, 2),
            "average_response_time": round(response_time, 2),
            "mistake_rate": round(mistake_rate, 4),
            "repeated_mistakes": repeated,
            "improvement_rate": round(improvement, 4),
            "completed_sessions": sessions,
            "difficulty_level": difficulty,
            "recommended_support_area": label,
        })
    return pd.DataFrame(records, columns=FEATURE_COLUMNS + ["recommended_support_area"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate documented synthetic MVP training data.")
    parser.add_argument("--rows", type=int, default=500)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", type=Path, default=Path("ml/dataset/therapist_training.csv"))
    args = parser.parse_args()
    frame = generate(args.rows, args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(args.output, index=False)
    print(f"Wrote {len(frame)} synthetic rows to {args.output}")
