from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import HTTPException

from backend.ai.prompts import build_scenario_prompt
from backend.models.schemas import ChildProfile

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class GeminiService:
    """Local Ollama text generation plus Pollinations image generation."""

    def __init__(self, api_key: str | None = None, model_name: str | None = None) -> None:
        self.ollama_url = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
        self.model_name = model_name or os.getenv("OLLAMA_MODEL", "llama3.2:3b")

    def _extract_json(self, content: str) -> dict[str, Any]:
        cleaned = content.strip()
        fenced_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL | re.IGNORECASE)
        if fenced_match:
            cleaned = fenced_match.group(1)

        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end < start:
            raise ValueError("Ollama response did not contain JSON.")

        payload = json.loads(cleaned[start : end + 1])
        if not isinstance(payload, dict):
            raise ValueError("Ollama response JSON must be an object.")
        return payload

    def generate_scenario(self, profile: ChildProfile, difficulty: int) -> dict[str, Any]:
        prompt = build_scenario_prompt(profile.model_dump(), difficulty)

        try:
            request_body = json.dumps({
                "model": self.model_name,
                "prompt": prompt,
                "format": "json",
                "stream": False,
                "options": {"temperature": 0.4},
            }).encode("utf-8")
            request = Request(
                f"{self.ollama_url}/api/generate",
                data=request_body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urlopen(request, timeout=120) as response:
                response_body = json.loads(response.read().decode("utf-8"))
            text = response_body.get("response", "")
            payload = self._extract_json(text)

            required_fields = {
                "scenario_id",
                "question",
                "context",
                "image_prompt",
                "image_alt",
                "hotspots",
                "options",
                "best_answer",
                "explanation",
            }
            missing = sorted(required_fields - set(payload.keys()))
            if missing:
                raise ValueError(f"Ollama response is missing required fields: {missing}")

            if "target_skill" not in payload:
                payload["target_skill"] = "communication"

            return payload
        except Exception as exc:  # pragma: no cover - external service failure path
            raise HTTPException(
                status_code=503,
                detail=f"Ollama scenario generation failed: {exc}",
            ) from exc

    def generate_image(self, image_prompt: str) -> bytes:
        """Download a prototype image from Pollinations AI."""
        prompt = quote(image_prompt, safe="")
        url = (
            f"https://image.pollinations.ai/prompt/{prompt}"
            "?width=1024&height=576&nologo=true"
        )

        try:
            request = Request(url, headers={"User-Agent": "InteractiveSkillsEnhancer/1.0"})
            with urlopen(request, timeout=120) as response:
                image_bytes = response.read()
                content_type = response.headers.get_content_type()

            if content_type not in {"image/png", "image/jpeg", "image/webp"}:
                raise ValueError(f"Pollinations returned unsupported content type: {content_type}")
            return image_bytes
        except Exception as exc:  # pragma: no cover - external service failure path
            raise HTTPException(
                status_code=503,
                detail=f"Pollinations image generation failed: {exc}",
            ) from exc


gemini_service = GeminiService()
