# Therapist Recommendation MVP Dataset

## Source and limitations

This dataset is **synthetic and hackathon-only**. It is not patient data, clinical data, Kaggle data, or therapist-labelled evidence. It contains 500 deterministic generated rows from `generate_synthetic_dataset.py`, with a small amount of controlled label noise. The rows represent measurable learning-indicator patterns so the Random Forest pipeline can be demonstrated end to end. It must not be used for diagnosis, treatment decisions, or clinical claims.

The model predicts an educational **recommended support area**. It does not diagnose ASD, intellectual disability, emotional disorders, or any medical condition.

## Target labels

- `Speech & Communication Support`
- `Social Skills Support`
- `Emotional/Social Understanding Support`
- `Behavioral/Functional Skills Support`

These labels are configurable in `ml/preprocessing.py`.

## Features

- `communication_score`: 0-100 communication task performance.
- `social_interaction_score`: 0-100 social interaction task performance.
- `empathy_score`: 0-100 empathy task performance.
- `emotion_recognition_score`: 0-100 emotion recognition task performance.
- `response_accuracy`: 0-100 response accuracy.
- `average_response_time`: average response time in seconds, 0-180.
- `mistake_rate`: fraction of mistakes, 0-1.
- `repeated_mistakes`: repeated mistake count, 0-20.
- `improvement_rate`: recent trend, -1 to 1.
- `completed_sessions`: completed learning sessions, 0-1000.
- `difficulty_level`: current difficulty, 1-3.

## Intended use

The model is an explainable educational support signal for a parent or educator. Use it with human judgement and consider consulting a qualified professional. Do not use recorded video or facial signals as model features.

See `DATA_RESEARCH.md` for the public/Kaggle data review and a future data-governance checklist.
