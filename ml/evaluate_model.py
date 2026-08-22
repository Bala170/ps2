from __future__ import annotations

import argparse
from pathlib import Path

import joblib
from sklearn.metrics import accuracy_score, classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

from preprocessing import FEATURE_COLUMNS, TARGET_COLUMN, load_dataset


def evaluate(model_path: Path, dataset_path: Path, random_state: int = 42) -> dict:
    bundle = joblib.load(model_path)
    frame = load_dataset(dataset_path)
    _, test_frame = train_test_split(frame, test_size=0.25, random_state=random_state, stratify=frame[TARGET_COLUMN])
    predictions = bundle["model"].predict(test_frame[FEATURE_COLUMNS])
    result = {
        "accuracy": float(accuracy_score(test_frame[TARGET_COLUMN], predictions)),
        "precision": float(precision_score(test_frame[TARGET_COLUMN], predictions, average="weighted", zero_division=0)),
        "recall": float(recall_score(test_frame[TARGET_COLUMN], predictions, average="weighted", zero_division=0)),
        "f1": float(f1_score(test_frame[TARGET_COLUMN], predictions, average="weighted", zero_division=0)),
        "classification_report": classification_report(test_frame[TARGET_COLUMN], predictions, zero_division=0),
        "test_samples": len(test_frame),
    }
    print(result["classification_report"])
    print(f"Accuracy: {result['accuracy']:.4f}")
    print(f"Precision: {result['precision']:.4f}")
    print(f"Recall: {result['recall']:.4f}")
    print(f"F1-score: {result['f1']:.4f}")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, default=Path("ml/models/therapist_recommender.pkl"))
    parser.add_argument("--dataset", type=Path, default=Path("ml/dataset/therapist_training.csv"))
    parser.add_argument("--random-state", type=int, default=42)
    args = parser.parse_args()
    evaluate(args.model, args.dataset, args.random_state)
