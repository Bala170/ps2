from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import HTTPException
import google.generativeai as genai

from backend.ai.prompts import build_scenario_prompt
from backend.models.schemas import ChildProfile

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class GeminiService:
    """Reusable Gemini service for scenario generation."""

    def __init__(self, api_key: str | None = None, model_name: str | None = None) -> None:
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name or os.getenv("MODEL_NAME", "gemini-1.5-flash")

        if self.api_key:
            genai.configure(api_key=self.api_key)

    def _extract_json(self, content: str) -> dict[str, Any]:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()

        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end < start:
            raise ValueError("Gemini response did not contain JSON.")

        return json.loads(cleaned[start : end + 1])

    def generate_scenario(self, profile: ChildProfile, difficulty: int) -> dict[str, Any]:
        if not self.api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

        prompt = build_scenario_prompt(profile.model_dump(), difficulty)

        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            text = getattr(response, "text", None) or str(response)
            payload = self._extract_json(text)

            required_fields = {"scenario_id", "question", "context", "options", "best_answer", "explanation"}
            missing = sorted(required_fields - set(payload.keys()))
            if missing:
                raise ValueError(f"Gemini response is missing required fields: {missing}")

            if "target_skill" not in payload:
                payload["target_skill"] = "communication"

            return payload
        except Exception as exc:  # pragma: no cover - external service failure path
            raise HTTPException(
                status_code=503,
                detail=f"Gemini scenario generation failed: {exc}",
            ) from exc


gemini_service = GeminiService()
