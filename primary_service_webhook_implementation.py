"""
Document Request Webhook Implementation for Primary Production Service

This module provides the webhook endpoint implementation that can be integrated
into the primary-production-1d298 service to handle document requests from n8n.

URL: https://primary-production-1d298.up.railway.app/webhook/426951f9-1936-44c3-83ae-8f52f0508acf
"""

import json
import traceback
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Literal
from io import BytesIO

# In-memory storage for document requests (in production, use a proper database)
document_requests_db: Dict[str, Dict[str, Any]] = {}

def get_current_timestamp() -> str:
    """Get current timestamp in ISO format with timezone"""
    return datetime.now(timezone.utc).isoformat()

def handle_binary_file_upload(file_data: bytes, filename: str, request_id: str, document_type: str, parameters: str):
    """Handle binary file upload via multipart/form-data"""
    try:
        # Generate request ID if not provided
        if not request_id:
            request_id = str(uuid.uuid4())
        
        # Check if request already exists
        if request_id in document_requests_db:
            return {
                "status": "error",
                "message": f"Document request with ID {request_id} already exists",
                "requestId": request_id
            }, 409
        
        # Parse parameters if provided
        parsed_parameters = None
        if parameters:
            try:
                parsed_parameters = json.loads(parameters)
            except json.JSONDecodeError:
                print(f"Warning: Invalid JSON parameters: {parameters}")
        
        # Create new document request with file info
        document_requests_db[request_id] = {
            "requestId": request_id,
            "status": "Ready",  # File is immediately available
            "documentType": document_type or "uploaded_file",
            "parameters": parsed_parameters,
            "downloadUrl": None,  # File is stored in the request
            "fileName": filename,
            "fileSize": len(file_data),
            "errorMessage": None,
            "createdAt": get_current_timestamp(),
            "updatedAt": get_current_timestamp(),
            "file_content": file_data  # Store file content
        }
        
        print(f"Binary file uploaded: {request_id}, filename: {filename}, size: {len(file_data)}")
        
        return {
            "status": "success",
            "message": f"Binary file uploaded successfully: {filename}",
            "requestId": request_id
        }, 200
        
    except Exception as e:
        print(f"Error handling binary file upload: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}, 500

def handle_json_request(request_data: Dict[str, Any]):
    """Handle JSON format request"""
    try:
        request_id = request_data.get("requestId")
        
        # Check if this is a completion notification (Type B)
        if "action" in request_data:
            # Type B: Completion notification
            if request_id not in document_requests_db:
                return {
                    "status": "error",
                    "message": f"Document request with ID {request_id} not found"
                }, 404
            
            # Update existing request
            document_requests_db[request_id].update({
                "status": "Ready" if request_data["action"] == "completed" else "Failed",
                "downloadUrl": request_data.get("downloadUrl"),
                "fileName": request_data.get("fileName"),
                "fileSize": request_data.get("fileSize"),
                "errorMessage": request_data.get("errorMessage"),
                "updatedAt": get_current_timestamp()
            })
            
            status_message = "Document processing completed successfully"
            if request_data["action"] == "failed":
                status_message = f"Document processing failed: {request_data.get('errorMessage', 'Unknown error')}"
            
            print(f"Document request {request_id} updated: {request_data['action']}")
            
            return {
                "status": "success",
                "message": status_message,
                "requestId": request_id
            }, 200
        
        else:
            # Type A: Initial request
            # Check if request already exists
            if request_id in document_requests_db:
                return {
                    "status": "error",
                    "message": f"Document request with ID {request_id} already exists"
                }, 409
            
            # Create new document request
            document_requests_db[request_id] = {
                "requestId": request_id,
                "status": "Requested",
                "documentType": request_data.get("documentType"),
                "parameters": request_data.get("parameters"),
                "downloadUrl": None,
                "fileName": None,
                "fileSize": None,
                "errorMessage": None,
                "createdAt": get_current_timestamp(),
                "updatedAt": get_current_timestamp()
            }
            
            print(f"New document request created: {request_id}")
            
            return {
                "status": "success",
                "message": "Document request created successfully",
                "requestId": request_id
            }, 200
            
    except Exception as e:
        print(f"Error handling JSON request: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}, 500

def get_document_requests():
    """Get all document requests for frontend display"""
    try:
        # Get all requests and sort by created_at DESC
        requests = list(document_requests_db.values())
        requests.sort(key=lambda x: x["createdAt"], reverse=True)
        
        return {
            "requests": requests,
            "total": len(requests)
        }, 200
        
    except Exception as e:
        print(f"Error getting document requests: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}, 500

def get_document_request(request_id: str):
    """Get a specific document request by ID"""
    try:
        if request_id not in document_requests_db:
            return {
                "status": "error",
                "message": f"Document request with ID {request_id} not found"
            }, 404
        
        return document_requests_db[request_id], 200
        
    except Exception as e:
        print(f"Error getting document request {request_id}: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}, 500

def download_document_file(request_id: str):
    """Download the binary file content for a specific document request"""
    try:
        if request_id not in document_requests_db:
            return {
                "status": "error",
                "message": f"Document request with ID {request_id} not found"
            }, 404
        
        request_data = document_requests_db[request_id]
        
        # Check if file content exists
        if "file_content" not in request_data or request_data["file_content"] is None:
            return {
                "status": "error",
                "message": f"No file content available for request {request_id}"
            }, 404
        
        # Check if status is Ready
        if request_data["status"] != "Ready":
            return {
                "status": "error",
                "message": f"Document is not ready for download. Current status: {request_data['status']}"
            }, 400
        
        file_content = request_data["file_content"]
        file_name = request_data.get("fileName", f"document_{request_id}")
        
        # Determine content type based on file extension
        content_type = "application/octet-stream"
        if file_name.lower().endswith(('.pdf',)):
            content_type = "application/pdf"
        elif file_name.lower().endswith(('.doc', '.docx')):
            content_type = "application/msword"
        elif file_name.lower().endswith(('.xls', '.xlsx')):
            content_type = "application/vnd.ms-excel"
        elif file_name.lower().endswith(('.txt',)):
            content_type = "text/plain"
        elif file_name.lower().endswith(('.csv',)):
            content_type = "text/csv"
        
        # Return file data with headers
        headers = {
            "Content-Type": content_type,
            "Content-Disposition": f"attachment; filename={file_name}",
            "Content-Length": str(len(file_content))
        }
        
        return file_content, 200, headers
        
    except Exception as e:
        print(f"Error downloading file for request {request_id}: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}, 500

def delete_document_request(request_id: str):
    """Delete a document request by ID"""
    try:
        if request_id not in document_requests_db:
            return {
                "status": "error",
                "message": f"Document request with ID {request_id} not found"
            }, 404
        
        del document_requests_db[request_id]
        print(f"Document request deleted: {request_id}")
        
        return {
            "status": "success",
            "message": f"Document request {request_id} deleted successfully"
        }, 200
        
    except Exception as e:
        print(f"Error deleting document request {request_id}: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}, 500

# Main webhook handler function
def handle_webhook_request(request_data=None, file_data=None, form_data=None):
    """
    Main webhook handler for the document request endpoint
    
    This function should be called by your web framework (Flask, FastAPI, etc.)
    with the appropriate request data.
    
    Args:
        request_data: JSON request body (for JSON requests)
        file_data: Binary file data (for multipart/form-data with file)
        form_data: Form data fields (for multipart/form-data)
    
    Returns:
        tuple: (response_data, status_code, headers)
    """
    try:
        # Handle multipart/form-data (binary file upload)
        if file_data is not None:
            filename = form_data.get("fileName", "uploaded_file") if form_data else "uploaded_file"
            request_id = form_data.get("requestId") if form_data else None
            document_type = form_data.get("documentType") if form_data else None
            parameters = form_data.get("parameters") if form_data else None
            
            return handle_binary_file_upload(file_data, filename, request_id, document_type, parameters)
        
        # Handle JSON request
        if request_data is not None:
            return handle_json_request(request_data)
        
        # Handle form data without file (completion notification or initial request)
        if form_data is not None:
            if "action" in form_data:
                # Completion notification
                return handle_json_request({
                    "requestId": form_data.get("requestId"),
                    "action": form_data.get("action"),
                    "downloadUrl": form_data.get("downloadUrl"),
                    "fileName": form_data.get("fileName"),
                    "fileSize": form_data.get("fileSize"),
                    "errorMessage": form_data.get("errorMessage")
                })
            else:
                # Initial request
                return handle_json_request({
                    "requestId": form_data.get("requestId"),
                    "documentType": form_data.get("documentType"),
                    "parameters": form_data.get("parameters")
                })
        
        return {"status": "error", "message": "No valid request data provided"}, 400
        
    except Exception as e:
        print(f"Error in webhook handler: {str(e)}")
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}, 500

# API endpoints for frontend
def handle_get_document_requests():
    """Handle GET /api/document-requests"""
    return get_document_requests()

def handle_get_document_request(request_id: str):
    """Handle GET /api/document-requests/{request_id}"""
    return get_document_request(request_id)

def handle_download_document(request_id: str):
    """Handle GET /api/document-requests/{request_id}/download"""
    return download_document_file(request_id)

def handle_delete_document_request(request_id: str):
    """Handle DELETE /api/document-requests/{request_id}"""
    return delete_document_request(request_id) 