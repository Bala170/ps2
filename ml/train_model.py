from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

from preprocessing import FEATURE_COLUMNS, TARGET_COLUMN, load_dataset


def train(dataset_path: Path, output_dir: Path, random_state: int = 42) -> dict:
    frame = load_dataset(dataset_path)
    x_train, x_test, y_train, y_test = train_test_split(
        frame[FEATURE_COLUMNS], frame[TARGET_COLUMN], test_size=0.25,
        random_state=random_state, stratify=frame[TARGET_COLUMN],
    )
    model = RandomForestClassifier(n_estimators=300, max_depth=8, min_samples_leaf=1, class_weight="balanced", random_state=random_state, n_jobs=-1)
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    labels = list(model.classes_)
    metrics = {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision_weighted": float(precision_score(y_test, predictions, average="weighted", zero_division=0)),
        "recall_weighted": float(recall_score(y_test, predictions, average="weighted", zero_division=0)),
        "f1_weighted": float(f1_score(y_test, predictions, average="weighted", zero_division=0)),
        "classification_report": classification_report(y_test, predictions, labels=labels, zero_division=0),
        "confusion_matrix": confusion_matrix(y_test, predictions, labels=labels).tolist(),
        "feature_importance": dict(sorted(zip(FEATURE_COLUMNS, model.feature_importances_), key=lambda pair: pair[1], reverse=True)),
        "train_samples": int(len(x_train)), "test_samples": int(len(x_test)), "feature_count": len(FEATURE_COLUMNS),
        "class_count": len(labels), "classes": labels, "random_state": random_state,
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "feature_columns": FEATURE_COLUMNS, "classes": labels, "metrics": metrics}, output_dir / "therapist_recommender.pkl")
    joblib.dump(FEATURE_COLUMNS, output_dir / "feature_columns.pkl")
    (output_dir / "therapist_recommender_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    figure, axis = plt.subplots(figsize=(10, 7))
    axis.imshow(metrics["confusion_matrix"], cmap="Blues")
    axis.set(xticks=range(len(labels)), yticks=range(len(labels)), xticklabels=labels, yticklabels=labels, xlabel="Predicted support area", ylabel="Actual support area", title="Therapist Recommendation Confusion Matrix")
    plt.setp(axis.get_xticklabels(), rotation=35, ha="right", rotation_mode="anchor")
    for row in range(len(labels)):
        for column in range(len(labels)):
            axis.text(column, row, metrics["confusion_matrix"][row][column], ha="center", va="center")
    figure.tight_layout()
    figure.savefig(output_dir / "confusion_matrix.png", dpi=160)
    plt.close(figure)

    importance_items = list(metrics["feature_importance"].items())[::-1]
    figure, axis = plt.subplots(figsize=(9, 6))
    axis.barh([item[0] for item in importance_items], [item[1] for item in importance_items], color="#7BC7F0")
    axis.set(title="Therapist Recommendation Feature Importance", xlabel="Random Forest importance")
    figure.tight_layout()
    figure.savefig(output_dir / "feature_importance.png", dpi=160)
    plt.close(figure)

    print(f"Samples: {len(frame)} (train={len(x_train)}, test={len(x_test)})")
    print(f"Features: {len(FEATURE_COLUMNS)} | Classes: {len(labels)}")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision_weighted']:.4f}")
    print(f"Recall: {metrics['recall_weighted']:.4f}")
    print(f"F1-score: {metrics['f1_weighted']:.4f}")
    print("Classification report:\n" + metrics["classification_report"])
    print("Feature importance:")
    for feature, importance in metrics["feature_importance"].items():
        print(f"  {feature}: {importance:.4f}")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, default=Path("ml/dataset/therapist_training.csv"))
    parser.add_argument("--output-dir", type=Path, default=Path("ml/models"))
    parser.add_argument("--random-state", type=int, default=42)
    args = parser.parse_args()
    train(args.dataset, args.output_dir, args.random_state)
