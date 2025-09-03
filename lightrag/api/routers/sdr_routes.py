"""
SDR (Supporting Document Retrieval) routes

Endpoints:
- POST /api/sdr/callback: receive status updates/links from n8n and upsert records
- GET  /api/sdr/requests: list records for UI polling

Persistence is a JSON file under the configured working directory. For
production-grade persistence, consider database-backed storage.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from lightrag.api.config import global_args
from lightrag.api.utils_api import get_combined_auth_dependency
from lightrag.utils import logger
from lightrag.kg.shared_storage import get_storage_lock


router = APIRouter(tags=["sdr"])


class SDRLink(BaseModel):
    name: str = Field(description="Display name for the link")
    url: str = Field(description="URL to download or view the artifact")


class SDRCallbackPayload(BaseModel):
    clientBatchId: Optional[str] = None
    pbcId: Optional[str] = None
    clientRequestId: Optional[str] = None
    status: Optional[str] = None
    docType: Optional[str] = None
    entity: Optional[str] = None
    links: Optional[List[SDRLink]] = None
    message: Optional[str] = None
    approvedAt: Optional[str] = None

    @field_validator("status", mode="after")
    @classmethod
    def normalize_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return value.strip()


class SDRRecord(BaseModel):
    clientBatchId: Optional[str] = None
    clientRequestId: str
    docType: Optional[str] = None
    entity: Optional[str] = None
    status: Optional[str] = None
    links: List[SDRLink] = Field(default_factory=list)
    lastUpdate: str


def _db_file_path() -> Path:
    base_dir = Path(global_args.working_dir)
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir / "sdr_requests.json"


def _load_db() -> Dict[str, Dict[str, Any]]:
    path = _db_file_path()
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
    except Exception as e:
        logger.warning(f"Failed to load SDR DB: {e}")
    return {}


def _save_db(db: Dict[str, Dict[str, Any]]) -> None:
    path = _db_file_path()
    tmp_path = Path(str(path) + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, path)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_sdr_routes(api_key: Optional[str] = None) -> APIRouter:
    combined_auth = get_combined_auth_dependency(api_key)

    @router.post("/api/sdr/callback", dependencies=[Depends(combined_auth)])
    async def sdr_callback(event: SDRCallbackPayload):
        """
        Upsert a SDR record keyed by clientRequestId. If clientRequestId is missing,
        derive a deterministic key from clientBatchId + docType + entity, else
        return a 400 error if no usable key can be determined.
        """
        key: Optional[str] = event.clientRequestId
        if not key and event.clientBatchId:
            parts = [event.clientBatchId, event.docType or "", event.entity or ""]
            candidate = "|".join(parts).strip("|")
            key = candidate if candidate else None

        if not key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing clientRequestId (or clientBatchId+docType+entity)",
            )

        record = SDRRecord(
            clientBatchId=event.clientBatchId,
            clientRequestId=key,
            docType=event.docType,
            entity=event.entity,
            status=event.status,
            links=event.links or [],
            lastUpdate=_now_iso(),
        )

        async with get_storage_lock():
            db = _load_db()
            db[key] = record.model_dump()
            _save_db(db)

        logger.info(
            "SDR callback upserted: clientRequestId=%s status=%s links=%d",
            key,
            record.status,
            len(record.links),
        )
        return {"status": "ok"}

    @router.get(
        "/api/sdr/requests",
        response_model=List[SDRRecord],
        dependencies=[Depends(combined_auth)],
    )
    async def list_sdr_requests() -> List[SDRRecord]:
        """
        Return list of SDR records for UI polling.
        """
        db = _load_db()
        items = [SDRRecord(**v) for v in db.values()]
        items.sort(key=lambda r: r.lastUpdate, reverse=True)
        return items

    return router
