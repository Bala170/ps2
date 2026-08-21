export type ScenarioHotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  meaning: string;
};

export type Scenario = {
  scenario_id: string;
  question: string;
  context: string;
  options: Record<string, string>;
  best_answer: string;
  explanation: string;
  difficulty: number;
  target_skill: string;
  image_url: string | null;
  image_alt: string | null;
  hotspots: ScenarioHotspot[];
};

export type ScenarioRequest = {
  child_id: string;
  age: number;
  interest: string;
  skill_level: number;
  target_skill: string;
  difficulty: number;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");

function resolveAssetUrl(assetUrl: string | null): string | null {
  if (!assetUrl) return null;
  return assetUrl.startsWith("http") ? assetUrl : `${API_BASE_URL}${assetUrl}`;
}

export async function createScenario(request: ScenarioRequest): Promise<Scenario> {
  const response = await fetch(`${API_BASE_URL}/api/v1/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof payload?.detail === "string" ? payload.detail : "We could not make a new story.";
    throw new Error(detail);
  }

  return { ...payload, image_url: resolveAssetUrl(payload.image_url) } as Scenario;
}
