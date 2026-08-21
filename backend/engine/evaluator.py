from __future__ import annotations


class Evaluator:
    """Placeholder evaluator for scoring and validation."""

    def evaluate(self, response: str) -> float:
        return float(len(response.strip()) > 0)
