#!/usr/bin/env python3
"""
Document Request Webhook System Demo

This script demonstrates the document request webhook system with:
1. Creating initial document requests (Type A)
2. Sending completion notifications (Type B)
3. Retrieving document request status
"""

import requests
import json
import time
import uuid
from typing import Dict, Any

# Configuration
LIGHTRAG_BASE_URL = "http://localhost:9621"  # Change this to your LightRAG server URL
API_KEY = None  # Set this if you have API key authentication enabled

# Headers for requests
headers = {
    "Content-Type": "application/json",
}

if API_KEY:
    headers["Authorization"] = f"Bearer {API_KEY}"


def send_webhook_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a request to the document request webhook endpoint.

    Args:
        payload: The webhook payload

    Returns:
        Response from the API
    """
    url = f"{LIGHTRAG_BASE_URL}/webhook/426951f9-1936-44c3-83ae-8f52f0508acf"

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending webhook: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        return None


def get_document_requests() -> Dict[str, Any]:
    """
    Get all document requests.

    Returns:
        Response from the API
    """
    url = f"{LIGHTRAG_BASE_URL}/webhook/api/document-requests"

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting document requests: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        return None


def get_document_request(request_id: str) -> Dict[str, Any]:
    """
    Get a specific document request by ID.

    Args:
        request_id: The request ID

    Returns:
        Response from the API
    """
    url = f"{LIGHTRAG_BASE_URL}/webhook/api/document-requests/{request_id}"

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting document request {request_id}: {e}")
        if hasattr(e, "response") and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        return None


def demo_initial_request():
    """Demo creating an initial document request (Type A)"""
    print("\n=== Demo 1: Initial Document Request (Type A) ===")

    # Create initial request payload
    payload = {
        "requestId": f"req_{uuid.uuid4().hex[:8]}",  # Generate unique ID
        "documentType": "financial_report",
        "parameters": {
            "year": 2024,
            "quarter": "Q1",
            "company": "Acme Corp",
            "report_type": "quarterly",
        },
    }

    print(f"Sending initial request with ID: {payload['requestId']}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    result = send_webhook_request(payload)

    if result:
        print(f"✅ Success: {result['message']}")
        print(f"Request ID: {result['requestId']}")
        return result["requestId"]
    else:
        print("❌ Failed to create initial request")
        return None


def demo_completion_notification(request_id: str):
    """Demo sending a completion notification (Type B)"""
    print("\n=== Demo 2: Completion Notification (Type B) ===")

    # Create completion notification payload
    payload = {
        "requestId": request_id,
        "action": "completed",
        "downloadUrl": "https://example.com/downloads/financial_report_2024_Q1.pdf",
        "fileName": "financial_report_2024_Q1.pdf",
        "fileSize": 1024000,  # 1MB
        "errorMessage": None,
    }

    print(f"Sending completion notification for request: {request_id}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    result = send_webhook_request(payload)

    if result:
        print(f"✅ Success: {result['message']}")
    else:
        print("❌ Failed to send completion notification")


def demo_failed_completion_notification(request_id: str):
    """Demo sending a failed completion notification (Type B)"""
    print("\n=== Demo 3: Failed Completion Notification (Type B) ===")

    # Create failed completion notification payload
    payload = {
        "requestId": request_id,
        "action": "failed",
        "downloadUrl": None,
        "fileName": None,
        "fileSize": None,
        "errorMessage": "Document generation failed due to insufficient data",
    }

    print(f"Sending failed completion notification for request: {request_id}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    result = send_webhook_request(payload)

    if result:
        print(f"✅ Success: {result['message']}")
    else:
        print("❌ Failed to send failed completion notification")


def demo_auto_generated_request_id():
    """Demo creating a request without providing an ID (auto-generated)"""
    print("\n=== Demo 4: Auto-Generated Request ID ===")

    # Create request without requestId (will be auto-generated)
    payload = {
        "documentType": "invoice_report",
        "parameters": {
            "customer_id": "CUST12345",
            "date_range": "2024-01-01 to 2024-01-31",
            "format": "PDF",
        },
    }

    print("Sending request without requestId (will be auto-generated)")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    result = send_webhook_request(payload)

    if result:
        print(f"✅ Success: {result['message']}")
        print(f"Auto-generated Request ID: {result['requestId']}")
        return result["requestId"]
    else:
        print("❌ Failed to create request with auto-generated ID")
        return None


def demo_get_all_requests():
    """Demo retrieving all document requests"""
    print("\n=== Demo 5: Get All Document Requests ===")

    result = get_document_requests()

    if result:
        print(f"✅ Success: Found {result['total']} document requests")
        print("\nDocument Requests:")
        for i, req in enumerate(result["requests"], 1):
            print(f"\n{i}. Request ID: {req['requestId']}")
            print(f"   Status: {req['status']}")
            print(f"   Document Type: {req['documentType']}")
            print(f"   Created: {req['createdAt']}")
            print(f"   Updated: {req['updatedAt']}")

            if req["downloadUrl"]:
                print(f"   Download URL: {req['downloadUrl']}")
                print(f"   File Name: {req['fileName']}")
                print(f"   File Size: {req['fileSize']} bytes")

            if req["errorMessage"]:
                print(f"   Error: {req['errorMessage']}")
    else:
        print("❌ Failed to get document requests")


def demo_get_specific_request(request_id: str):
    """Demo retrieving a specific document request"""
    print("\n=== Demo 6: Get Specific Document Request ===")

    result = get_document_request(request_id)

    if result:
        print(f"✅ Success: Retrieved document request {request_id}")
        print(f"Status: {result['status']}")
        print(f"Document Type: {result['documentType']}")
        print(f"Created: {result['createdAt']}")
        print(f"Updated: {result['updatedAt']}")

        if result["downloadUrl"]:
            print(f"Download URL: {result['downloadUrl']}")
            print(f"File Name: {result['fileName']}")
            print(f"File Size: {result['fileSize']} bytes")

        if result["errorMessage"]:
            print(f"Error: {result['errorMessage']}")
    else:
        print(f"❌ Failed to get document request {request_id}")


def demo_download_file(request_id: str):
    """Demo downloading a file"""
    print("\n=== Demo 7: Download File ===")

    # First check if the request exists and is ready
    result = get_document_request(request_id)
    if not result:
        print(f"❌ Request {request_id} not found")
        return

    if result["status"] != "Ready":
        print(
            f"❌ Request {request_id} is not ready for download (status: {result['status']})"
        )
        return

    # Download the file
    response = requests.get(
        f"{LIGHTRAG_BASE_URL}/webhook/api/document-requests/{request_id}/download",
        headers={"Authorization": f"Bearer {API_KEY}"},
    )

    if response.status_code == 200:
        # Save the file locally
        filename = f"downloaded_file_{request_id}.bin"
        with open(filename, "wb") as f:
            f.write(response.content)

        print(f"✅ File downloaded successfully: {filename}")
        print(f"File size: {len(response.content)} bytes")
        print(f"Content-Type: {response.headers.get('content-type', 'unknown')}")
        print(
            f"Content-Disposition: {response.headers.get('content-disposition', 'unknown')}"
        )
    else:
        print(f"❌ Download failed: {response.status_code}")
        print(f"Error: {response.text}")


def demo_error_handling():
    """Demo error handling scenarios"""
    print("\n=== Demo 8: Error Handling ===")

    # Test 1: Try to update non-existent request
    print("\n1. Testing update of non-existent request...")
    payload = {
        "requestId": "non_existent_id",
        "action": "completed",
        "downloadUrl": "https://example.com/file.pdf",
        "fileName": "file.pdf",
        "fileSize": 1000,
    }

    result = send_webhook_request(payload)
    if result is None:
        print("✅ Correctly handled non-existent request")

    # Test 2: Try to create duplicate request
    print("\n2. Testing duplicate request creation...")
    request_id = f"req_{uuid.uuid4().hex[:8]}"

    # Create first request
    payload1 = {"requestId": request_id, "documentType": "test_report"}

    result1 = send_webhook_request(payload1)
    if result1:
        print("✅ First request created successfully")

        # Try to create duplicate
        result2 = send_webhook_request(payload1)
        if result2 is None:
            print("✅ Correctly handled duplicate request")

    # Test 3: Invalid payload
    print("\n3. Testing invalid payload...")
    invalid_payload = {"invalid_field": "invalid_value"}

    result = send_webhook_request(invalid_payload)
    if result is None:
        print("✅ Correctly handled invalid payload")


def main():
    """Run all demos"""
    print("🚀 Document Request Webhook System Demo")
    print("=" * 60)

    # Check if server is running
    try:
        response = requests.get(f"{LIGHTRAG_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ LightRAG server is running")
        else:
            print("❌ LightRAG server is not responding properly")
            return
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to LightRAG server. Please make sure it's running.")
        print(f"   Expected URL: {LIGHTRAG_BASE_URL}")
        return

    # Run demos
    request_id_1 = demo_initial_request()
    time.sleep(1)

    if request_id_1:
        demo_completion_notification(request_id_1)
        time.sleep(1)

    request_id_2 = demo_auto_generated_request_id()
    time.sleep(1)

    if request_id_2:
        demo_failed_completion_notification(request_id_2)
        time.sleep(1)

    demo_get_all_requests()
    time.sleep(1)

    if request_id_1:
        demo_get_specific_request(request_id_1)
        time.sleep(1)

        # Test download functionality if the request is ready
        demo_download_file(request_id_1)
        time.sleep(1)

    demo_error_handling()

    print("\n" + "=" * 60)
    print("🎉 Demo completed!")
    print("\nYou can now use the frontend API to display document requests:")
    print(f"GET {LIGHTRAG_BASE_URL}/webhook/api/document-requests")


if __name__ == "__main__":
    main()
