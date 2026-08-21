from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any


class AdaptiveEngine:
    """Deterministic adaptive engine for skill progression and recommendations."""

    def __init__(self) -> None:
        self.profiles: dict[str, dict[str, Any]] = {}
        self.attempts: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self.scenarios: dict[str, dict[str, Any]] = {}
        self.child_state: dict[str, dict[str, Any]] = {}

    def create_child_profile(self, profile: dict[str, Any]) -> dict[str, Any]:
        child_id = profile.get("child_id") or f"child-{len(self.profiles) + 1}"
        normalized = {
            "child_id": child_id,
            "age": int(profile["age"]),
            "interest": str(profile["interest"]),
            "skill_level": int(profile["skill_level"]),
            "target_skill": str(profile["target_skill"]),
            "difficulty": max(1, min(3, int(profile.get("difficulty", 1)))),
        }
        self.profiles[child_id] = normalized
        self.child_state.setdefault(child_id, {"difficulty": normalized["difficulty"], "last_skill": normalized["target_skill"]})
        return normalized

    def get_child_profile(self, child_id: str) -> dict[str, Any] | None:
        return self.profiles.get(child_id)

    def store_scenario(self, scenario: dict[str, Any]) -> dict[str, Any]:
        self.scenarios[scenario["scenario_id"]] = scenario
        return scenario

    def get_scenario(self, scenario_id: str) -> dict[str, Any] | None:
        return self.scenarios.get(scenario_id)

    @staticmethod
    def calculate_performance(score: float) -> float:
        return round(max(0.0, min(1.0, float(score))) * 100, 2)

    def record_attempt(self, child_id: str, scenario_id: str, score: float, skill: str) -> dict[str, Any]:
        attempt = {
            "child_id": child_id,
            "scenario_id": scenario_id,
            "score": float(score),
            "skill": skill,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.attempts[child_id].append(attempt)

        difficulty = self.child_state.setdefault(child_id, {"difficulty": 1, "last_skill": skill})
        if score >= 0.8:
            difficulty["difficulty"] = min(3, difficulty["difficulty"] + 1)
        elif score <= 0.4:
            difficulty["difficulty"] = max(1, difficulty["difficulty"] - 1)
        difficulty["last_skill"] = skill

        return attempt

    def get_attempts_for_child(self, child_id: str) -> list[dict[str, Any]]:
        return self.attempts.get(child_id, [])

    def get_average_score(self, child_id: str) -> float:
        attempts = self.get_attempts_for_child(child_id)
        if not attempts:
            return 0.0
        return round(sum(item["score"] for item in attempts) / len(attempts), 3)

    def get_skill_performance(self, child_id: str) -> dict[str, float]:
        skill_scores: dict[str, list[float]] = defaultdict(list)
        for attempt in self.get_attempts_for_child(child_id):
            skill_scores[attempt["skill"]].append(float(attempt["score"]))

        aggregated: dict[str, float] = {}
        for skill, scores in skill_scores.items():
            aggregated[skill] = round(sum(scores) / len(scores), 3)
        return dict(sorted(aggregated.items()))

    def identify_weakest_skill(self, child_id: str) -> str:
        profile = self.get_child_profile(child_id)
        if not profile:
            return "communication"

        attempts = self.get_attempts_for_child(child_id)
        if not attempts:
            return profile.get("target_skill", "communication")

        skills = defaultdict(list)
        for attempt in attempts:
            skills[attempt["skill"]].append(float(attempt["score"]))

        weakest_skill = min(skills.items(), key=lambda item: sum(item[1]) / len(item[1]))[0]
        return weakest_skill

    def recommend_next_activity(self, child_id: str) -> dict[str, Any]:
        profile = self.get_child_profile(child_id)
        if not profile:
            return {
                "child_id": child_id,
                "skill": "communication",
                "difficulty": 1,
                "recommendation": "Start with a simple greeting scenario.",
                "reason": "No profile was found for this child yet.",
            }

        weakest_skill = self.identify_weakest_skill(child_id)
        current_difficulty = self.child_state.get(child_id, {}).get("difficulty", profile["difficulty"])
        if self.get_average_score(child_id) >= 0.75:
            current_difficulty = min(3, current_difficulty + 1)
        elif self.get_average_score(child_id) < 0.45:
            current_difficulty = max(1, current_difficulty - 1)

        recommendation = {
            "child_id": child_id,
            "skill": weakest_skill,
            "difficulty": int(current_difficulty),
            "recommendation": f"Practice {weakest_skill} with a {profile['interest']}-based activity at level {current_difficulty}.",
            "reason": "This skill has the lowest average performance and needs targeted practice.",
        }
        return recommendation


adaptive_engine = AdaptiveEngine()
