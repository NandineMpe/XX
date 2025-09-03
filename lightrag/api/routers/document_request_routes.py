"""
Document Request Webhook System

This module handles document requests from the frontend and completion notifications from n8n,
enabling real-time status updates and document downloads.
"""

import asyncio
import json
import traceback
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Literal
from io import BytesIO
import os
import random
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from lightrag.utils import logger
from lightrag.api.utils_api import get_combined_auth_dependency
from lightrag.api.config import global_args
import httpx
from lightrag.kg.shared_storage import get_namespace_data, get_storage_lock

# Shared storage namespace for document requests
DOCUMENT_REQUESTS_NS = "document_requests"

router = APIRouter(
    prefix="/webhook",
    tags=["document-requests"],
)

# Create combined auth dependency - will be set in create_document_request_routes function
combined_auth = None


class DocumentRequestWebhookRequest(BaseModel):
    """Request model for document request webhook (JSON format)

    This handles both initial requests (Type A) and completion notifications (Type B)
    """

    # Type A fields (initial request)
    requestId: Optional[str] = Field(
        default=None, description="Unique request ID (auto-generated if not provided)"
    )
    documentType: Optional[str] = Field(
        default=None, description="Type of document being requested"
    )
    parameters: Optional[Dict[str, Any]] = Field(
        default=None, description="Additional parameters for document generation"
    )

    # Type B fields (completion notification)
    action: Optional[str] = Field(
        default=None, description="Action type (e.g., 'completed', 'failed')"
    )
    downloadUrl: Optional[str] = Field(
        default=None, description="URL where the completed document can be downloaded"
    )
    fileName: Optional[str] = Field(
        default=None, description="Name of the generated file"
    )
    fileSize: Optional[int] = Field(
        default=None, description="Size of the generated file in bytes"
    )
    errorMessage: Optional[str] = Field(
        default=None, description="Error message if processing failed"
    )

    @field_validator("requestId", mode="after")
    @classmethod
    def generate_request_id_if_missing(cls, request_id: Optional[str]) -> str:
        """Generate a request ID if not provided"""
        if not request_id:
            return str(uuid.uuid4())
        return request_id

    class Config:
        json_schema_extra = {
            "example": {
                "requestId": "req_12345",
                "documentType": "financial_report",
                "parameters": {"year": 2024, "quarter": "Q1"},
            }
        }


class DocumentRequestWebhookBinaryRequest(BaseModel):
    """Request model for document request webhook with binary file upload

    This handles binary file uploads with form data
    """

    requestId: Optional[str] = Field(
        default=None, description="Unique request ID (auto-generated if not provided)"
    )
    documentType: Optional[str] = Field(
        default=None, description="Type of document being uploaded"
    )
    parameters: Optional[str] = Field(
        default=None, description="Additional parameters as JSON string"
    )

    @field_validator("requestId", mode="after")
    @classmethod
    def generate_request_id_if_missing(cls, request_id: Optional[str]) -> str:
        """Generate a request ID if not provided"""
        if not request_id:
            return str(uuid.uuid4())
        return request_id


class DocumentRequestResponse(BaseModel):
    """Response model for document request webhook"""

    status: Literal["success", "error"] = Field(description="Status of the operation")
    message: str = Field(description="Response message")
    requestId: str = Field(description="Request ID for tracking")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Document request created successfully",
                "requestId": "req_12345",
            }
        }


class DocumentRequestStatus(BaseModel):
    """Model for document request status"""

    requestId: str = Field(description="Unique request identifier")
    status: Literal["Requested", "Processing", "Ready", "Failed"] = Field(
        description="Current status of the request"
    )
    documentType: Optional[str] = Field(
        default=None, description="Type of document requested"
    )
    parameters: Optional[Dict[str, Any]] = Field(
        default=None, description="Parameters used for document generation"
    )
    downloadUrl: Optional[str] = Field(
        default=None, description="URL for downloading the completed document"
    )
    fileName: Optional[str] = Field(
        default=None, description="Name of the generated file"
    )
    fileSize: Optional[int] = Field(
        default=None, description="Size of the file in bytes"
    )
    errorMessage: Optional[str] = Field(
        default=None, description="Error message if processing failed"
    )
    createdAt: str = Field(description="Creation timestamp (ISO format)")
    updatedAt: str = Field(description="Last update timestamp (ISO format)")
    file_content: Optional[bytes] = Field(
        default=None, description="Binary content of the file if stored directly"
    )
    clientBatchId: Optional[str] = Field(
        default=None,
        description="Client-supplied batch identifier for grouping and UI correlation",
    )
    callbackUrl: Optional[str] = Field(
        default=None,
        description="Callback URL that n8n will use to notify status/links",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "requestId": "req_12345",
                "status": "Ready",
                "documentType": "financial_report",
                "parameters": {"year": 2024, "quarter": "Q1"},
                "downloadUrl": "https://example.com/downloads/report.pdf",
                "fileName": "financial_report_2024_Q1.pdf",
                "fileSize": 1024000,
                "createdAt": "2024-01-15T10:30:00Z",
                "updatedAt": "2024-01-15T10:35:00Z",
            }
        }


class DocumentRequestsResponse(BaseModel):
    """Response model for document requests list"""

    requests: List[DocumentRequestStatus] = Field(
        description="List of document requests"
    )
    total: int = Field(description="Total number of requests")

    class Config:
        json_schema_extra = {
            "example": {
                "requests": [
                    {
                        "requestId": "req_12345",
                        "status": "Ready",
                        "documentType": "financial_report",
                        "downloadUrl": "https://example.com/downloads/report.pdf",
                        "fileName": "financial_report_2024_Q1.pdf",
                        "fileSize": 1024000,
                        "createdAt": "2024-01-15T10:30:00Z",
                        "updatedAt": "2024-01-15T10:35:00Z",
                    }
                ],
                "total": 1,
            }
        }


def get_current_timestamp() -> str:
    """Get current timestamp in ISO format with timezone"""
    return datetime.now(timezone.utc).isoformat()


async def handle_binary_file_upload(
    file: UploadFile, request_id: str, document_type: str, parameters: str
) -> DocumentRequestResponse:
    """Handle binary file upload via multipart/form-data"""
    try:
        db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
        # Generate request ID if not provided
        if not request_id:
            request_id = str(uuid.uuid4())

        # Parse parameters if provided
        parsed_parameters = None
        if parameters:
            try:
                parsed_parameters = json.loads(parameters)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON parameters: {parameters}")

        # Check if request already exists and create new document request with file info
        async with get_storage_lock():
            if request_id in db:
                raise HTTPException(
                    status_code=409,
                    detail=f"Document request with ID {request_id} already exists",
                )

            db[request_id] = {
                "requestId": request_id,
                "status": "Ready",  # File is immediately available
                "documentType": document_type or "uploaded_file",
                "parameters": parsed_parameters,
                "downloadUrl": None,  # File is stored in the request
                "fileName": file.filename,
                "fileSize": file.size,
                "errorMessage": None,
                "createdAt": get_current_timestamp(),
                "updatedAt": get_current_timestamp(),
                "file_content": await file.read(),  # Store file content
            }

        logger.info(
            f"Binary file uploaded: {request_id}, filename: {file.filename}, size: {file.size}"
        )

        return DocumentRequestResponse(
            status="success",
            message=f"Binary file uploaded successfully: {file.filename}",
            requestId=request_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling binary file upload: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


async def handle_json_request(
    request: DocumentRequestWebhookRequest,
) -> DocumentRequestResponse:
    """Handle JSON format request"""
    try:
        db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
        request_id = request.requestId

        # Check if this is a completion notification (Type B)
        if request.action:
            # Type B: Completion notification
            async with get_storage_lock():
                if request_id not in db:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Document request with ID {request_id} not found",
                    )

                # Update existing request
                db[request_id].update(
                    {
                        "status": "Ready"
                        if request.action == "completed"
                        else "Failed",
                        "downloadUrl": request.downloadUrl,
                        "fileName": request.fileName,
                        "fileSize": request.fileSize,
                        "errorMessage": request.errorMessage,
                        "updatedAt": get_current_timestamp(),
                    }
                )

            status_message = "Document processing completed successfully"
            if request.action == "failed":
                status_message = f"Document processing failed: {request.errorMessage or 'Unknown error'}"

            logger.info(f"Document request {request_id} updated: {request.action}")

            return DocumentRequestResponse(
                status="success", message=status_message, requestId=request_id
            )

        else:
            # Type A: Initial request
            async with get_storage_lock():
                # Check if request already exists
                if request_id in db:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Document request with ID {request_id} already exists",
                    )

                # Create new document request
                db[request_id] = {
                    "requestId": request_id,
                    "status": "Requested",
                    "documentType": request.documentType,
                    "parameters": request.parameters,
                    "downloadUrl": None,
                    "fileName": None,
                    "fileSize": None,
                    "errorMessage": None,
                    "createdAt": get_current_timestamp(),
                    "updatedAt": get_current_timestamp(),
                }

            logger.info(f"New document request created: {request_id}")

            return DocumentRequestResponse(
                status="success",
                message="Document request created successfully",
                requestId=request_id,
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling JSON request: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


async def handle_form_completion_notification(
    request_id: str,
    action: str,
    download_url: str,
    file_name: str,
    file_size: int,
    error_message: str,
    file: UploadFile | None = None,
) -> DocumentRequestResponse:
    """Handle completion notification via form data

    Supports optional binary `file` to finalize and store the artifact in one call.
    """
    try:
        db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
        if not request_id:
            raise HTTPException(status_code=400, detail="requestId is required")

        async with get_storage_lock():
            if request_id not in db:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document request with ID {request_id} not found",
                )

            # Prepare file-related fields
            stored_file_bytes = None
            resolved_file_name = file_name
            resolved_file_size = file_size

            if file is not None:
                # Read and store uploaded file content
                stored_file_bytes = await file.read()
                resolved_file_name = resolved_file_name or file.filename
                try:
                    # UploadFile may not always expose size; fall back to len(bytes)
                    resolved_file_size = (
                        resolved_file_size
                        or getattr(file, "size", None)
                        or len(stored_file_bytes)
                    )
                except Exception:
                    resolved_file_size = resolved_file_size or len(stored_file_bytes)

            # Update existing request
            db[request_id].update(
                {
                    "status": "Ready" if action == "completed" else "Failed",
                    "downloadUrl": download_url
                    or f"/webhook/api/document-requests/{request_id}/download",
                    "fileName": resolved_file_name,
                    "fileSize": resolved_file_size,
                    "errorMessage": error_message,
                    "updatedAt": get_current_timestamp(),
                    "file_content": stored_file_bytes
                    if stored_file_bytes is not None
                    else db[request_id].get("file_content"),
                }
            )

        status_message = "Document processing completed successfully"
        if action == "failed":
            status_message = (
                f"Document processing failed: {error_message or 'Unknown error'}"
            )

        logger.info(f"Document request {request_id} updated via form: {action}")

        return DocumentRequestResponse(
            status="success", message=status_message, requestId=request_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling form completion notification: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


async def handle_form_initial_request(
    request_id: str, document_type: str, parameters: str
) -> DocumentRequestResponse:
    """Handle initial request via form data"""
    try:
        db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
        # Generate request ID if not provided
        if not request_id:
            request_id = str(uuid.uuid4())

        # Parse parameters if provided
        parsed_parameters = None
        if parameters:
            try:
                parsed_parameters = json.loads(parameters)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON parameters: {parameters}")

        # Check if request already exists and create new document request
        async with get_storage_lock():
            if request_id in db:
                raise HTTPException(
                    status_code=409,
                    detail=f"Document request with ID {request_id} already exists",
                )

            db[request_id] = {
                "requestId": request_id,
                "status": "Requested",
                "documentType": document_type,
                "parameters": parsed_parameters,
                "downloadUrl": None,
                "fileName": None,
                "fileSize": None,
                "errorMessage": None,
                "createdAt": get_current_timestamp(),
                "updatedAt": get_current_timestamp(),
                "clientBatchId": parsed_parameters.get("clientBatchId")
                if isinstance(parsed_parameters, dict)
                else None,
                "callbackUrl": parsed_parameters.get("callbackUrl")
                if isinstance(parsed_parameters, dict)
                else None,
            }

        logger.info(f"New document request created via form: {request_id}")

        return DocumentRequestResponse(
            status="success",
            message="Document request created successfully",
            requestId=request_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling form initial request: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


def create_document_request_routes(api_key: Optional[str] = None):
    """Create document request routes"""
    global combined_auth
    combined_auth = get_combined_auth_dependency(api_key)

    @router.post(
        "/426951f9-1936-44c3-83ae-8f52f0508acf",
        response_model=DocumentRequestResponse,
        dependencies=[Depends(combined_auth)],
    )
    async def document_request_webhook(
        request: DocumentRequestWebhookRequest = None,
        file: UploadFile = File(None),
        requestId: str = None,
        documentType: str = None,
        parameters: str = None,
        action: str = None,
        downloadUrl: str = None,
        fileName: str = None,
        fileSize: int = None,
        errorMessage: str = None,
    ):
        """
        Webhook endpoint for document requests and completion notifications.

        This endpoint handles both JSON and multipart/form-data requests:

        JSON Format:
        - Type A (Initial Request): No 'action' field present
        - Type B (Completion Notification): Has 'action' field present

        Multipart/Form-Data Format:
        - Binary file upload with form fields
        - Creates document request with uploaded file

        Args:
            request: JSON request body (optional)
            file: Uploaded binary file (optional)
            requestId: Request ID from form data
            documentType: Document type from form data
            parameters: Parameters as JSON string from form data
            action: Action type from form data
            downloadUrl: Download URL from form data
            fileName: File name from form data
            fileSize: File size from form data
            errorMessage: Error message from form data

        Returns:
            DocumentRequestResponse: Response with status and request ID
        """
        try:
            # Handle form data with action (completion notification) - CHECK THIS FIRST
            if action is not None:
                return await handle_form_completion_notification(
                    requestId,
                    action,
                    downloadUrl,
                    fileName,
                    fileSize,
                    errorMessage,
                    file,
                )

            # Handle multipart/form-data (binary file upload)
            if file is not None:
                return await handle_binary_file_upload(
                    file, requestId, documentType, parameters
                )

            # Handle JSON request
            if request is not None:
                return await handle_json_request(request)

            # Handle form data without action (initial request)
            return await handle_form_initial_request(
                requestId, documentType, parameters
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in document request webhook: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.post(
        "/pbc/import",
        response_model=DocumentRequestResponse,
        dependencies=[Depends(combined_auth)],
    )
    async def pbc_import(request: DocumentRequestWebhookRequest):
        """
        Create a new local workflow entry for PBC import and forward to external webhook.
        """
        try:
            # Always create a new workflow/request locally
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
            request_id = request.requestId or str(uuid.uuid4())
            async with get_storage_lock():
                if request_id in db:
                    # Ensure uniqueness by regenerating
                    request_id = str(uuid.uuid4())
                client_batch_id = (
                    (request.parameters or {}).get("clientBatchId")
                    if isinstance(request.parameters, dict)
                    else None
                )
                callback_url = (
                    (request.parameters or {}).get("callbackUrl")
                    if isinstance(request.parameters, dict)
                    else None
                )
                db[request_id] = {
                    "requestId": request_id,
                    "status": "Requested",
                    "documentType": request.documentType or "pbc_import",
                    "parameters": request.parameters,
                    "downloadUrl": None,
                    "fileName": None,
                    "fileSize": None,
                    "errorMessage": None,
                    "createdAt": get_current_timestamp(),
                    "updatedAt": get_current_timestamp(),
                    "clientBatchId": client_batch_id,
                    "callbackUrl": callback_url,
                }

            # Extract email parameters
            params = request.parameters or {}
            subject = params.get("subject")
            html_content = params.get("html")
            to_address = params.get("to")

            if not subject or not html_content or not to_address:
                raise HTTPException(
                    status_code=400,
                    detail="parameters.subject, parameters.html, and parameters.to are required",
                )

            # Build outbound payload as required by production workflow
            payload = {
                "message": {
                    "subject": subject,
                    "body": {"contentType": "HTML", "content": html_content},
                    "toRecipients": [{"emailAddress": {"address": to_address}}],
                },
                "saveToSentItems": False,
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(global_args.pbc_import_webhook, json=payload)
                # Do not fail local creation on remote error; just log
                if resp.status_code >= 400:
                    logger.warning(
                        f"PBC import forward failed {resp.status_code}: {resp.text}"
                    )

            return DocumentRequestResponse(
                status="success",
                message="PBC import request created and forwarded",
                requestId=request_id,
            )
        except Exception as e:
            logger.error(f"Error creating PBC import: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    class PBCSimulateRequest(BaseModel):
        clientBatchId: str
        callbackUrl: Optional[str] = None
        rows: List[Dict[str, Any]]

    @router.post(
        "/pbc/import/simulate",
        dependencies=[Depends(combined_auth)],
    )
    async def pbc_import_simulate(payload: PBCSimulateRequest):
        """
        Simulate asynchronous retrieval for a list of PBC rows.

        - Creates a new request for each row with status Processing
        - Within random delays (5s..60s), marks known doc types as Ready with given URLs
        - Unknown types remain Processing with no downloadUrl
        """
        try:
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)

            # Known document mapping to provided download links
            known_links = {
                # normalize keys to lowercase
                "purchase order": "https://ifonjarzvpechegr.public.blob.vercel-storage.com/Purchase%20Order%20GL%20Listing.xlsx",
                "purchase order listing": "https://ifonjarzvpechegr.public.blob.vercel-storage.com/Purchase%20Order%20GL%20Listing.xlsx",
                "purchase order gl listing": "https://ifonjarzvpechegr.public.blob.vercel-storage.com/Purchase%20Order%20GL%20Listing.xlsx",
                "minutes of tariff meetings": "https://ifonjarzvpechegr.public.blob.vercel-storage.com/Minutes%20of%20tariff%20meetings.pdf",
                "tariff meetings": "https://ifonjarzvpechegr.public.blob.vercel-storage.com/Minutes%20of%20tariff%20meetings.pdf",
                "final tax assessment": "https://ifonjarzvpechegr.public.blob.vercel-storage.com/Tax%20Assessment.pdf",
                "tax assessment": "https://ifonjarzvpechegr.public.blob.vercel-storage.com/Tax%20Assessment.pdf",
            }

            request_ids: List[str] = []

            async with get_storage_lock():
                for row in payload.rows:
                    document_type = str(
                        row.get("doc_type")
                        or row.get("documentType")
                        or "Document Request"
                    ).strip()
                    rid = str(uuid.uuid4())
                    db[rid] = {
                        "requestId": rid,
                        "status": "Processing",
                        "documentType": document_type,
                        "parameters": row,
                        "downloadUrl": None,
                        "fileName": None,
                        "fileSize": None,
                        "errorMessage": None,
                        "createdAt": get_current_timestamp(),
                        "updatedAt": get_current_timestamp(),
                        "clientBatchId": payload.clientBatchId,
                        "callbackUrl": payload.callbackUrl,
                    }
                    request_ids.append(rid)

            async def simulate_one(rid: str):
                try:
                    # random delay up to 60s
                    delay_sec = random.randint(5, 60)
                    await asyncio.sleep(delay_sec)

                    db_inner = await get_namespace_data(DOCUMENT_REQUESTS_NS)
                    row = db_inner.get(rid)
                    if not row:
                        return
                    doc_type = (row.get("documentType") or "").lower()

                    # find best link by simple fuzzy contains
                    link: Optional[str] = None
                    for key, url in known_links.items():
                        if key in doc_type:
                            link = url
                            break

                    async with get_storage_lock():
                        if link:
                            # derive file name from URL path
                            path = urlparse(link).path
                            file_name = os.path.basename(path)
                            row.update(
                                {
                                    "status": "Ready",
                                    "downloadUrl": link,
                                    "fileName": file_name,
                                    "updatedAt": get_current_timestamp(),
                                }
                            )
                        else:
                            # keep Processing, no link yet
                            row.update({"updatedAt": get_current_timestamp()})

                    # Optional: call callbackUrl
                    cb = row.get("callbackUrl")
                    if cb:
                        try:
                            data = {
                                "requestId": rid,
                                "status": row.get("status"),
                                "downloadUrl": row.get("downloadUrl"),
                                "fileName": row.get("fileName"),
                                "fileSize": row.get("fileSize"),
                                "errorMessage": row.get("errorMessage"),
                            }
                            async with httpx.AsyncClient(timeout=20.0) as client:
                                await client.post(cb, json=data)
                        except Exception as cb_err:
                            logger.debug(f"Callback failed for {rid}: {cb_err}")
                except Exception as sim_err:
                    logger.debug(f"Simulation error for {rid}: {sim_err}")

            # schedule background tasks
            for rid in request_ids:
                asyncio.create_task(simulate_one(rid))

            return {
                "status": "accepted",
                "accepted": len(request_ids),
                "clientBatchId": payload.clientBatchId,
                "requestIds": request_ids,
            }
        except Exception as e:
            logger.error(f"Error in pbc_import_simulate: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    # SDR callback endpoint for n8n to post status updates and links
    @router.post(
        "/api/sdr/callback",
        dependencies=[Depends(combined_auth)],
    )
    async def sdr_callback(
        requestId: Optional[str] = None,
        clientBatchId: Optional[str] = None,
        status: Optional[str] = None,
        downloadUrl: Optional[str] = None,
        fileName: Optional[str] = None,
        fileSize: Optional[int] = None,
        errorMessage: Optional[str] = None,
        payload: Dict[str, Any] = None,
    ):
        try:
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
            updated_count = 0

            async with get_storage_lock():
                if requestId:
                    targets = [requestId] if requestId in db else []
                elif clientBatchId:
                    targets = [
                        rid
                        for rid, row in db.items()
                        if row.get("clientBatchId") == clientBatchId
                    ]
                else:
                    raise HTTPException(
                        status_code=400, detail="requestId or clientBatchId required"
                    )

                for rid in targets:
                    row = db[rid]
                    if status:
                        row["status"] = status
                    if downloadUrl:
                        row["downloadUrl"] = downloadUrl
                    if fileName:
                        row["fileName"] = fileName
                    if fileSize is not None:
                        row["fileSize"] = fileSize
                    if errorMessage is not None:
                        row["errorMessage"] = errorMessage
                    row["updatedAt"] = get_current_timestamp()
                    updated_count += 1

            return {"status": "ok", "updated": updated_count}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in SDR callback: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    # Endpoint to query rows by clientBatchId for UI polling
    @router.get(
        "/api/document-requests/batch/{client_batch_id}",
        dependencies=[Depends(combined_auth)],
    )
    async def get_batch_status(client_batch_id: str):
        try:
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
            rows = [
                row
                for row in db.values()
                if row.get("clientBatchId") == client_batch_id
            ]
            rows.sort(key=lambda x: x["createdAt"], reverse=False)
            return {
                "clientBatchId": client_batch_id,
                "total": len(rows),
                "rows": rows,
            }
        except Exception as e:
            logger.error(f"Error getting batch status for {client_batch_id}: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.get(
        "/api/document-requests",
        response_model=DocumentRequestsResponse,
        dependencies=[Depends(combined_auth)],
    )
    async def get_document_requests():
        """
        Get all document requests for frontend display.

        Returns:
            DocumentRequestsResponse: List of all document requests ordered by creation date
        """
        try:
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
            # Get all requests and sort by created_at DESC
            requests = list(db.values())
            requests.sort(key=lambda x: x["createdAt"], reverse=True)

            # Convert to DocumentRequestStatus objects
            document_requests = [
                DocumentRequestStatus(**request) for request in requests
            ]

            return DocumentRequestsResponse(
                requests=document_requests, total=len(document_requests)
            )

        except Exception as e:
            logger.error(f"Error getting document requests: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.get(
        "/api/document-requests/{request_id}",
        response_model=DocumentRequestStatus,
        dependencies=[Depends(combined_auth)],
    )
    async def get_document_request(request_id: str):
        """
        Get a specific document request by ID.

        Args:
            request_id: The unique request identifier

        Returns:
            DocumentRequestStatus: The document request details
        """
        try:
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
            if request_id not in db:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document request with ID {request_id} not found",
                )

            return DocumentRequestStatus(**db[request_id])

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting document request {request_id}: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.get(
        "/api/document-requests/{request_id}/download",
        dependencies=[Depends(combined_auth)],
    )
    async def download_document_file(request_id: str):
        """
        Download the binary file content for a specific document request.

        Args:
            request_id: The unique request identifier

        Returns:
            StreamingResponse: The binary file content with appropriate headers
        """
        try:
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
            if request_id not in db:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document request with ID {request_id} not found",
                )

            request_data = db[request_id]

            # Check if file content exists
            if (
                "file_content" not in request_data
                or request_data["file_content"] is None
            ):
                raise HTTPException(
                    status_code=404,
                    detail=f"No file content available for request {request_id}",
                )

            # Check if status is Ready
            if request_data["status"] != "Ready":
                raise HTTPException(
                    status_code=400,
                    detail=f"Document is not ready for download. Current status: {request_data['status']}",
                )

            file_content = request_data["file_content"]
            file_name = request_data.get("fileName", f"document_{request_id}")

            # Determine content type based on file extension
            content_type = "application/octet-stream"
            if file_name.lower().endswith((".pdf",)):
                content_type = "application/pdf"
            elif file_name.lower().endswith((".doc", ".docx")):
                content_type = "application/msword"
            elif file_name.lower().endswith((".xls", ".xlsx")):
                content_type = "application/vnd.ms-excel"
            elif file_name.lower().endswith((".txt",)):
                content_type = "text/plain"
            elif file_name.lower().endswith((".csv",)):
                content_type = "text/csv"

            return StreamingResponse(
                BytesIO(file_content),
                media_type=content_type,
                headers={
                    "Content-Disposition": f"attachment; filename={file_name}",
                    "Content-Length": str(len(file_content)),
                },
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error downloading file for request {request_id}: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete(
        "/api/document-requests/{request_id}",
        dependencies=[Depends(combined_auth)],
    )
    async def delete_document_request(request_id: str):
        """
        Delete a document request by ID.

        Args:
            request_id: The unique request identifier

        Returns:
            Success message
        """
        try:
            db = await get_namespace_data(DOCUMENT_REQUESTS_NS)
            async with get_storage_lock():
                if request_id not in db:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Document request with ID {request_id} not found",
                    )

                del db[request_id]
            logger.info(f"Document request deleted: {request_id}")

            return {
                "status": "success",
                "message": f"Document request {request_id} deleted successfully",
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting document request {request_id}: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    return router
