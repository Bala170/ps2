from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routes.progress import router as progress_router
from backend.routes.responses import router as responses_router
from backend.routes.scenarios import router as scenarios_router

app = FastAPI(
    title="Interactive Skills Enhancer API",
    version="0.1.0",
    description="Backend MVP for the Interactive Skills Enhancer learning platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ise-backend"}


app.include_router(progress_router, prefix="/api/v1")
app.include_router(scenarios_router, prefix="/api/v1")
app.include_router(responses_router, prefix="/api/v1")

media_dir = Path(__file__).resolve().parents[1] / "media"
media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=media_dir), name="media")

frontend_dir = Path(__file__).resolve().parents[1] / "frontend"
if frontend_dir.exists():
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")
