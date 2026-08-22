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
  language?: string;
};

export type ChildProfileRequest = {
  child_id: string;
  age: number;
  interest: string;
  skill_level: number;
  target_skill: string;
  difficulty?: number;
};

export type LearningSession = {
  session_id: string;
  child_id: string;
  scenario_id: string;
  skill: string;
  difficulty: number;
  score: number | null;
  recording_enabled: boolean;
  video_storage_path: string | null;
  video_url: string | null;
  started_at: string;
  completed_at: string | null;
};

export type ActivityRecommendation = {
  child_id: string;
  skill: string;
  difficulty: 1 | 2 | 3;
  recommendation: string;
  reason: string;
  current_score: number;
  activity: string;
  caregiver_tip: string;
  source: string;
};

export type TherapistRecommendation = {
  child_id: string;
  recommended_support_area: string;
  confidence: number;
  key_indicators: Record<string, number>;
  reason: string;
  disclaimer: string;
};

const runtimeEnv = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
const API_BASE_URL = (runtimeEnv.VITE_API_BASE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");
const PARENT_ACCESS_TOKEN = runtimeEnv.VITE_PARENT_ACCESS_TOKEN || "";

function parentHeaders(): HeadersInit {
  return PARENT_ACCESS_TOKEN ? { "X-Parent-Access": PARENT_ACCESS_TOKEN } : {};
}

function resolveAssetUrl(assetUrl: string | null): string | null {
  if (!assetUrl) return null;
  return assetUrl.startsWith("http") ? assetUrl : `${API_BASE_URL}${assetUrl}`;
}

export async function createScenario(request: ScenarioRequest): Promise<Scenario> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  const response = await fetch(`${API_BASE_URL}/api/v1/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: controller.signal,
  });
  window.clearTimeout(timeout);

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof payload?.detail === "string" ? payload.detail : "We could not make a new story.";
    throw new Error(detail);
  }

  return { ...payload, image_url: resolveAssetUrl(payload.image_url) } as Scenario;
}

export async function createChildProfile(request: ChildProfileRequest): Promise<ChildProfileRequest> {
  const response = await fetch(`${API_BASE_URL}/api/v1/progress/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return readApiResponse<ChildProfileRequest>(response);
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof payload?.detail === "string" ? payload.detail : "Something went wrong.";
    throw new Error(detail);
  }
  return payload as T;
}

export async function startLearningSession(request: {
  child_id: string;
  scenario_id: string;
  skill: string;
  difficulty: number;
  recording_enabled: boolean;
}): Promise<LearningSession> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return readApiResponse<LearningSession>(response);
}

export async function completeLearningSession(sessionId: string, score: number): Promise<LearningSession> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score }),
  });
  return readApiResponse<LearningSession>(response);
}

export async function uploadLearningSession(sessionId: string, recording: Blob): Promise<LearningSession> {
  const formData = new FormData();
  formData.append("video", recording, "replay.webm");
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}/upload`, {
    method: "POST",
    body: formData,
  });
  const session = await readApiResponse<LearningSession>(response);
  return { ...session, video_url: resolveAssetUrl(session.video_url) };
}

export async function listLearningSessions(childId: string): Promise<LearningSession[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/children/${encodeURIComponent(childId)}`, { headers: parentHeaders() });
  const sessions = await readApiResponse<LearningSession[]>(response);
  return sessions.map((session) => ({ ...session, video_url: resolveAssetUrl(session.video_url) }));
}

export async function getActivityRecommendation(childId: string): Promise<ActivityRecommendation> {
  const response = await fetch(`${API_BASE_URL}/api/v1/progress/recommendation/${encodeURIComponent(childId)}`);
  return readApiResponse<ActivityRecommendation>(response);
}

export async function getTherapistRecommendation(childId: string): Promise<TherapistRecommendation> {
  const response = await fetch(`${API_BASE_URL}/api/v1/children/${encodeURIComponent(childId)}/therapist-recommendation`);
  return readApiResponse<TherapistRecommendation>(response);
}

export async function getLearningSession(sessionId: string): Promise<LearningSession> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${encodeURIComponent(sessionId)}`, { headers: parentHeaders() });
  const session = await readApiResponse<LearningSession>(response);
  return { ...session, video_url: resolveAssetUrl(session.video_url) };
}
