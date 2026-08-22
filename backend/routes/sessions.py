from __future__ import annotations

from datetime import datetime, timezone
import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status

from backend.models.schemas import LearningSession, SessionCompleteRequest, SessionStartRequest
from backend.services.firebase import firebase_service

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Session metadata is kept separate from child attempts. Video bytes never enter Firestore.
local_sessions: dict[str, dict] = {}


def require_parent_access(x_parent_access: str | None = Header(default=None)) -> None:
    """Optional deployment gate for caregiver-only session history and replay."""
    expected_token = os.getenv("PARENT_ACCESS_TOKEN")
    if expected_token and x_parent_access != expected_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parent access is required.")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_session_or_404(session_id: str) -> dict:
    session = local_sessions.get(session_id)
    if not session and firebase_service.enabled:
        session = firebase_service.get_document("sessions", session_id)
        if session:
            local_sessions[session_id] = session
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning session not found.")
    return session


@router.post("/start", response_model=LearningSession)
def start_session(payload: SessionStartRequest) -> LearningSession:
    session_id = f"session-{uuid4().hex}"
    session = {
        "session_id": session_id,
        "child_id": payload.child_id,
        "scenario_id": payload.scenario_id,
        "skill": payload.skill,
        "difficulty": payload.difficulty,
        "score": None,
        "recording_enabled": payload.recording_enabled,
        "video_storage_path": None,
        "video_url": None,
        "started_at": now(),
        "completed_at": None,
    }
    local_sessions[session_id] = session
    if firebase_service.enabled:
        try:
            firebase_service.set_document("sessions", session_id, session)
        except Exception:
            pass
    return LearningSession(**session)


@router.post("/{session_id}/complete", response_model=LearningSession)
def complete_session(session_id: str, payload: SessionCompleteRequest) -> LearningSession:
    session = get_session_or_404(session_id)
    session["score"] = payload.score
    session["completed_at"] = now()
    local_sessions[session_id] = session
    if firebase_service.enabled:
        try:
            firebase_service.set_document("sessions", session_id, session)
        except Exception:
            pass
    return LearningSession(**session)


@router.post("/{session_id}/upload", response_model=LearningSession)
def upload_session_video(
    session_id: str,
    video: UploadFile = File(...),
) -> LearningSession:
    session = get_session_or_404(session_id)
    if not session["recording_enabled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recording was not enabled for this session.")

    video_bytes = video.file.read()
    if not video_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The recording is empty.")

    content_type = video.content_type or "video/webm"
    object_name = f"sessions/{session_id}/replay.webm"
    try:
        video_url = firebase_service.upload_video(video_bytes, object_name, content_type)
    except Exception:
        media_dir = Path(__file__).resolve().parents[2] / "media" / "sessions" / session_id
        media_dir.mkdir(parents=True, exist_ok=True)
        video_path = media_dir / "replay.webm"
        video_path.write_bytes(video_bytes)
        video_url = f"/media/sessions/{session_id}/replay.webm"

    session["video_storage_path"] = object_name
    session["video_url"] = video_url
    local_sessions[session_id] = session
    if firebase_service.enabled:
        try:
            firebase_service.set_document("sessions", session_id, session)
        except Exception:
            pass
    return LearningSession(**session)


@router.get("/children/{child_id}", response_model=list[LearningSession])
def list_child_sessions(child_id: str, _: None = Depends(require_parent_access)) -> list[LearningSession]:
    sessions = [session for session in local_sessions.values() if session["child_id"] == child_id]
    if not sessions and firebase_service.enabled:
        try:
            sessions = firebase_service.list_documents("sessions", "child_id", child_id)
            for session in sessions:
                local_sessions[session["session_id"]] = session
        except Exception:
            sessions = []
    return [LearningSession(**session) for session in sorted(sessions, key=lambda item: item["started_at"], reverse=True)]


@router.get("/{session_id}", response_model=LearningSession)
def get_session(session_id: str, _: None = Depends(require_parent_access)) -> LearningSession:
    return LearningSession(**get_session_or_404(session_id))
