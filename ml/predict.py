from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from .preprocessing import FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "models" / "therapist_recommender.pkl"


def load_model(model_path: Path = MODEL_PATH) -> dict[str, Any]:
    return joblib.load(model_path)


def predict_support_area(features: dict[str, float], model_path: Path = MODEL_PATH) -> dict[str, Any]:
    bundle = load_model(model_path)
    row = pd.DataFrame([{column: features[column] for column in FEATURE_COLUMNS}])
    model = bundle["model"]
    predicted = str(model.predict(row)[0])
    probabilities = model.predict_proba(row)[0]
    probability_map = {str(label): round(float(probability), 4) for label, probability in zip(model.classes_, probabilities)}
    return {"recommended_support_area": predicted, "confidence": probability_map.get(predicted, 0.0), "probabilities": probability_map}
