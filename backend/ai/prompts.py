from __future__ import annotations

import json
from typing import Any

SYSTEM_PROMPT = """
You are an AI assistant generating learning scenarios for children with ASD and intellectual disabilities.
Create clear, supportive, age-appropriate situations that help with social communication and daily life skills.
Keep the tone warm, simple, and respectful. Return only valid JSON.
"""


def build_scenario_prompt(profile: dict[str, Any], difficulty: int, language: str = "en") -> str:
    profile_json = json.dumps(profile, ensure_ascii=False)
    return f"""
{SYSTEM_PROMPT}

Generate one scenario for a child profile below.
- Difficulty: {difficulty} (1=easy, 2=medium, 3=challenging)
- Child profile: {profile_json}
- Output language: {language}. Write the question, context, options, explanation, image_alt, and hotspot text in this language.

Requirements:
1. Generate age-appropriate social or communication scenario.
2. Make it suitable for a child with ASD and ID.
3. Use the child's interest, including any custom interest entered by the child, target skill, and difficulty. Make the image and scenario clearly reflect that interest when appropriate.
4. Include 4 options labeled A, B, C, D.
5. Include the best answer and brief explanation.
6. Return valid JSON in this exact structure:
{{
  "scenario_id": "unique-id",
  "question": "short scenario question",
  "context": "brief situational context",
  "image_prompt": "child-safe illustration prompt for this scene",
  "image_alt": "short accessible description of the scene",
  "hotspots": [
    {{
      "id": "object-id",
      "label": "short object label",
      "x": 50,
      "y": 50,
      "radius": 10,
      "meaning": "why this object matters in the scene"
    }}
  ],
  "options": {{
    "A": "option text",
    "B": "option text",
    "C": "option text",
    "D": "option text"
  }},
  "best_answer": "A",
  "explanation": "why this is the best response"
}}

Image requirements:
- Create a warm, simple, child-friendly educational illustration with no frightening or unsafe content.
- Do not put readable words, letters, numbers, or answer choices inside the image.
- Include the key objects needed for the child to understand the situation.
- Return 1 to 3 hotspots for important visible objects.
- Hotspot x and y are percentages from the left and top edges (0 to 100).
- Hotspot radius is a percentage of the image width between 4 and 20.
- Hotspot labels must match visible objects, and meaning must explain the learning connection.
"""
