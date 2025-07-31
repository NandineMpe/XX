#!/usr/bin/env python3
"""
Demo script for the n8n webhook endpoint.

This script demonstrates how to send different types of content to the LightRAG system
via the n8n webhook endpoint. It shows examples for text, JSON, and file content types.
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
LIGHTRAG_BASE_URL = "http://localhost:8000"  # Adjust this to your LightRAG server URL
API_KEY = None  # Set this if you have API key authentication enabled

# Headers for the request
headers = {
    "Content-Type": "application/json",
}

if API_KEY:
    headers["Authorization"] = f"Bearer {API_KEY}"


def send_n8n_webhook(content: str, source: str = "n8n_webhook", 
                    metadata: Dict[str, Any] = None, content_type: str = "text") -> Dict[str, Any]:
    """
    Send content to the LightRAG system via the n8n webhook endpoint.
    
    Args:
        content: The content to send
        source: Source identifier
        metadata: Additional metadata
        content_type: Type of content ("text", "json", "file")
    
    Returns:
        Response from the API
    """
    payload = {
        "content": content,
        "source": source,
        "content_type": content_type
    }
    
    if metadata:
        payload["metadata"] = metadata
    
    url = f"{LIGHTRAG_BASE_URL}/documents/n8n_webhook"
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending webhook: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        return None


def demo_text_content():
    """Demo sending plain text content."""
    print("\n=== Demo 1: Plain Text Content ===")
    
    content = """
    This is a sample email content that was processed by n8n.
    
    Subject: Meeting Reminder
    From: john.doe@company.com
    To: team@company.com
    
    Hi Team,
    
    This is a reminder about our weekly meeting tomorrow at 10 AM.
    Please prepare your updates and join the call on time.
    
    Best regards,
    John
    """
    
    metadata = {
        "workflow_id": "email_processor_001",
        "trigger_type": "email",
        "timestamp": "2024-01-15T10:30:00Z",
        "sender": "john.doe@company.com",
        "recipients": ["team@company.com"]
    }
    
    result = send_n8n_webhook(
        content=content,
        source="email_processor",
        metadata=metadata,
        content_type="text"
    )
    
    if result:
        print(f"✅ Success: {result['message']}")
    else:
        print("❌ Failed to send text content")


def demo_json_content():
    """Demo sending JSON content."""
    print("\n=== Demo 2: JSON Content ===")
    
    json_data = {
        "customer_id": "CUST12345",
        "order_id": "ORD67890",
        "order_date": "2024-01-15T14:30:00Z",
        "items": [
            {
                "product_id": "PROD001",
                "name": "Laptop",
                "quantity": 1,
                "price": 999.99
            },
            {
                "product_id": "PROD002", 
                "name": "Mouse",
                "quantity": 2,
                "price": 25.50
            }
        ],
        "total_amount": 1050.99,
        "shipping_address": {
            "street": "123 Main St",
            "city": "New York",
            "state": "NY",
            "zip": "10001"
        }
    }
    
    metadata = {
        "workflow_id": "order_processor_002",
        "trigger_type": "webhook",
        "timestamp": "2024-01-15T14:35:00Z",
        "source_system": "ecommerce_platform"
    }
    
    result = send_n8n_webhook(
        content=json.dumps(json_data, indent=2),
        source="order_processor",
        metadata=metadata,
        content_type="json"
    )
    
    if result:
        print(f"✅ Success: {result['message']}")
    else:
        print("❌ Failed to send JSON content")


def demo_file_content():
    """Demo sending file content."""
    print("\n=== Demo 3: File Content ===")
    
    # Simulate file content (e.g., from a document scanner or file upload)
    file_content = """
    # Project Report - Q1 2024
    
    ## Executive Summary
    This report covers the first quarter performance of our main projects.
    
    ## Key Metrics
    - Revenue: $1.2M (15% increase from Q4 2023)
    - Customer Acquisition: 150 new customers
    - Churn Rate: 2.1% (below target of 3%)
    
    ## Project Status
    1. **Website Redesign**: 85% complete
    2. **Mobile App**: Beta testing phase
    3. **API Integration**: Completed
    
    ## Next Steps
    - Launch mobile app in Q2
    - Implement new payment system
    - Expand to European markets
    
    ## Budget Overview
    - Q1 Budget: $500K
    - Actual Spend: $485K
    - Variance: +$15K (under budget)
    """
    
    metadata = {
        "workflow_id": "document_processor_003",
        "trigger_type": "file_upload",
        "timestamp": "2024-01-15T16:00:00Z",
        "file_type": "markdown",
        "file_size": "2.3KB",
        "uploaded_by": "finance_team"
    }
    
    result = send_n8n_webhook(
        content=file_content,
        source="document_processor",
        metadata=metadata,
        content_type="file"
    )
    
    if result:
        print(f"✅ Success: {result['message']}")
    else:
        print("❌ Failed to send file content")


def demo_error_handling():
    """Demo error handling with invalid content."""
    print("\n=== Demo 4: Error Handling ===")
    
    # Test with invalid JSON
    invalid_json = "{ invalid json content }"
    
    metadata = {
        "workflow_id": "test_workflow",
        "trigger_type": "test",
        "timestamp": "2024-01-15T17:00:00Z"
    }
    
    result = send_n8n_webhook(
        content=invalid_json,
        source="test_processor",
        metadata=metadata,
        content_type="json"  # This should still work as it falls back to text
    )
    
    if result:
        print(f"✅ Success (fallback to text): {result['message']}")
    else:
        print("❌ Failed to send invalid JSON content")


def check_pipeline_status():
    """Check the pipeline status to see if documents are being processed."""
    print("\n=== Checking Pipeline Status ===")
    
    url = f"{LIGHTRAG_BASE_URL}/documents/pipeline_status"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        status = response.json()
        
        print(f"Pipeline Busy: {status.get('busy', False)}")
        print(f"Current Job: {status.get('job_name', 'None')}")
        print(f"Documents to Process: {status.get('docs', 0)}")
        print(f"Latest Message: {status.get('latest_message', 'None')}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error checking pipeline status: {e}")


def main():
    """Run all demos."""
    print("🚀 LightRAG n8n Webhook Demo")
    print("=" * 50)
    
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
    demo_text_content()
    time.sleep(1)  # Small delay between requests
    
    demo_json_content()
    time.sleep(1)
    
    demo_file_content()
    time.sleep(1)
    
    demo_error_handling()
    time.sleep(1)
    
    # Check pipeline status
    check_pipeline_status()
    
    print("\n" + "=" * 50)
    print("🎉 Demo completed!")
    print("\nYou can now query your LightRAG system to see the processed content.")
    print("Example query endpoint: POST /query")


if __name__ == "__main__":
    main() 