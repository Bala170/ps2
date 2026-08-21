from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import HTTPException
from google.cloud import firestore
from google.cloud import storage

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class FirebaseService:
    """Lightweight Firestore access layer for MVP persistence."""

    def __init__(self) -> None:
        self.project_id = os.getenv("FIREBASE_PROJECT_ID")
        self.credentials_path = (os.getenv("FIREBASE_CREDENTIALS_PATH") or "").strip().strip('"')
        self.client = None
        self.storage_client = None
        self.initialization_error: str | None = None

        if self.project_id:
            try:
                if self.credentials_path and os.path.exists(self.credentials_path):
                    self.client = firestore.Client.from_service_account_json(self.credentials_path)
                    self.storage_client = storage.Client.from_service_account_json(self.credentials_path)
                else:
                    self.client = firestore.Client(project=self.project_id)
                    self.storage_client = storage.Client(project=self.project_id)
            except Exception as exc:  # pragma: no cover - environment-specific configuration
                self.initialization_error = str(exc)

    def set_document(self, collection: str, document_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        if self.client is None:
            raise HTTPException(status_code=500, detail="Firebase is not configured.")
        doc_ref = self.client.collection(collection).document(document_id)
        doc_ref.set(payload)
        return payload

    def get_document(self, collection: str, document_id: str) -> dict[str, Any] | None:
        if self.client is None:
            raise HTTPException(status_code=500, detail="Firebase is not configured.")
        doc = self.client.collection(collection).document(document_id).get()
        return doc.to_dict() if doc.exists else None

    def upload_image(self, image_bytes: bytes, object_name: str) -> str:
        if self.storage_client is None:
            raise HTTPException(status_code=503, detail="Firebase Storage is not configured.")
        bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET") or f"{self.project_id}.appspot.com"
        blob = self.storage_client.bucket(bucket_name).blob(object_name)
        blob.upload_from_string(image_bytes, content_type="image/png")
        try:
            blob.make_public()
            return blob.public_url
        except Exception:
            return blob.generate_signed_url(version="v4", expiration=3600, method="GET")

    def add_document(self, collection: str, payload: dict[str, Any]) -> dict[str, Any]:
        if self.client is None:
            raise HTTPException(status_code=500, detail="Firebase is not configured.")
        self.client.collection(collection).add(payload)
        return payload

    def list_documents(self, collection: str, field: str, value: str) -> list[dict[str, Any]]:
        if self.client is None:
            raise HTTPException(status_code=500, detail="Firebase is not configured.")
        return [document.to_dict() for document in self.client.collection(collection).where(field, "==", value).stream()]

    @property
    def enabled(self) -> bool:
        return self.client is not None


firebase_service = FirebaseService()
