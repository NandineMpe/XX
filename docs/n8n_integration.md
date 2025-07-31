# n8n Integration with LightRAG

This document explains how to integrate n8n workflows with LightRAG using the dedicated webhook endpoint.

## Overview

LightRAG provides a specialized webhook endpoint (`/documents/n8n_webhook`) designed specifically for n8n integration. This endpoint allows you to send content from n8n workflows directly to your LightRAG system for processing and indexing.

## Endpoint Details

- **URL**: `POST /documents/n8n_webhook`
- **Authentication**: Same as other LightRAG endpoints (API key or session-based)
- **Content-Type**: `application/json`

## Request Format

### Request Body Schema

```json
{
  "content": "string (required)",
  "source": "string (optional, default: 'n8n_webhook')",
  "metadata": "object (optional)",
  "content_type": "string (optional, default: 'text')"
}
```

### Field Descriptions

- **content** (required): The main content to be inserted into LightRAG
- **source** (optional): Source identifier for the content. Defaults to "n8n_webhook"
- **metadata** (optional): Additional metadata from your n8n workflow
- **content_type** (optional): Type of content. Options: "text", "json", "file". Defaults to "text"

## Response Format

```json
{
  "status": "success",
  "message": "Content from n8n webhook (source_identifier) successfully received. Processing will continue in background."
}
```

## Usage Examples

### 1. Basic Text Content

```json
{
  "content": "This is a simple text message from n8n workflow",
  "source": "email_processor",
  "content_type": "text"
}
```

### 2. JSON Content

```json
{
  "content": "{\"customer_id\": \"12345\", \"order_total\": 99.99, \"items\": [\"item1\", \"item2\"]}",
  "source": "order_processor",
  "metadata": {
    "workflow_id": "order_workflow_001",
    "trigger_type": "webhook",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "content_type": "json"
}
```

### 3. File Content

```json
{
  "content": "# Document Title\n\nThis is the content of a document that was processed by n8n.",
  "source": "document_processor",
  "metadata": {
    "workflow_id": "doc_workflow_002",
    "file_type": "markdown",
    "file_size": "1.2KB",
    "uploaded_by": "user@company.com"
  },
  "content_type": "file"
}
```

## n8n Workflow Setup

### 1. HTTP Request Node Configuration

In your n8n workflow, add an HTTP Request node with the following settings:

- **Method**: POST
- **URL**: `http://your-lightrag-server:8000/documents/n8n_webhook`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY (if authentication is enabled)
  ```
- **Body**: JSON with the content you want to send

### 2. Example n8n Workflow

Here's a simple example of how to set up an n8n workflow:

1. **Trigger Node**: Email trigger (or any other trigger)
2. **Code Node**: Process the incoming data
3. **HTTP Request Node**: Send to LightRAG

#### Code Node Example

```javascript
// Extract content from email
const emailContent = $input.first().json.body;
const sender = $input.first().json.from;
const subject = $input.first().json.subject;

// Prepare payload for LightRAG
const payload = {
  content: `Subject: ${subject}\nFrom: ${sender}\n\n${emailContent}`,
  source: "email_processor",
  metadata: {
    workflow_id: "email_workflow_001",
    trigger_type: "email",
    timestamp: new Date().toISOString(),
    sender: sender,
    subject: subject
  },
  content_type: "text"
};

return [{ json: payload }];
```

#### HTTP Request Node Configuration

- **URL**: `http://your-lightrag-server:8000/documents/n8n_webhook`
- **Method**: POST
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**: `{{ $json }}` (reference to the output from the Code node)

## Content Processing

### Text Content
- Processed as-is
- No special formatting applied

### JSON Content
- Parsed and converted to readable string format
- If JSON parsing fails, falls back to treating as text
- Useful for structured data from APIs or databases

### File Content
- Processed as-is
- Suitable for document content, reports, etc.

## Error Handling

The endpoint includes robust error handling:

- **Invalid JSON**: Falls back to text processing
- **Missing content**: Returns 400 Bad Request
- **Server errors**: Returns 500 Internal Server Error with details

## Best Practices

### 1. Source Naming
Use descriptive source names to help identify the origin of content:
- `email_processor`
- `order_processor`
- `document_scanner`
- `api_integration`

### 2. Metadata Usage
Include relevant metadata to help with content organization:
- Workflow ID
- Trigger type
- Timestamp
- User information
- File details (for file content)

### 3. Content Size
- Keep content reasonable in size (recommended: < 1MB)
- For large documents, consider splitting into chunks
- Use the `/documents/texts` endpoint for multiple pieces of content

### 4. Rate Limiting
- LightRAG processes content asynchronously
- Avoid sending too many requests simultaneously
- Consider implementing delays between requests if needed

## Testing

Use the provided demo script to test the integration:

```bash
python examples/n8n_webhook_demo.py
```

This script demonstrates:
- Different content types
- Error handling
- Pipeline status checking

## Monitoring

### Check Processing Status

Monitor the processing status using the pipeline status endpoint:

```bash
curl -X GET "http://your-lightrag-server:8000/documents/pipeline_status"
```

### View Document Status

Check the status of processed documents:

```bash
curl -X GET "http://your-lightrag-server:8000/documents"
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure LightRAG server is running
   - Check the correct port and URL

2. **Authentication Errors**
   - Verify API key is correct
   - Check if authentication is enabled

3. **Content Not Appearing**
   - Check pipeline status for processing errors
   - Verify content format is correct
   - Look at server logs for detailed error messages

4. **Large Content Issues**
   - Consider splitting large content into smaller chunks
   - Use the batch endpoint for multiple pieces

### Debug Mode

Enable debug logging in LightRAG to see detailed processing information:

```bash
# Set log level to DEBUG
export LOG_LEVEL=DEBUG
```

## Security Considerations

1. **API Key Protection**
   - Store API keys securely in n8n
   - Use environment variables when possible
   - Rotate keys regularly

2. **Content Validation**
   - Validate content before sending to LightRAG
   - Sanitize user input
   - Be aware of content size limits

3. **Network Security**
   - Use HTTPS in production
   - Consider VPN or private network for internal deployments
   - Implement proper firewall rules

## Integration Examples

### Email Processing Workflow

```javascript
// n8n Code Node
const email = $input.first().json;
const payload = {
  content: `From: ${email.from}\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`,
  source: "email_processor",
  metadata: {
    workflow_id: "email_workflow",
    trigger_type: "email",
    timestamp: new Date().toISOString(),
    sender: email.from,
    recipients: email.to
  },
  content_type: "text"
};
return [{ json: payload }];
```

### Order Processing Workflow

```javascript
// n8n Code Node
const order = $input.first().json;
const payload = {
  content: JSON.stringify(order, null, 2),
  source: "order_processor",
  metadata: {
    workflow_id: "order_workflow",
    trigger_type: "webhook",
    timestamp: new Date().toISOString(),
    order_id: order.id,
    customer_id: order.customer_id
  },
  content_type: "json"
};
return [{ json: payload }];
```

### Document Upload Workflow

```javascript
// n8n Code Node
const file = $input.first().json;
const payload = {
  content: file.content,
  source: "document_processor",
  metadata: {
    workflow_id: "document_workflow",
    trigger_type: "file_upload",
    timestamp: new Date().toISOString(),
    file_name: file.name,
    file_type: file.type,
    file_size: file.size
  },
  content_type: "file"
};
return [{ json: payload }];
```

## Support

For issues or questions about the n8n integration:

1. Check the LightRAG documentation
2. Review server logs for error details
3. Test with the provided demo script
4. Check the pipeline status endpoint for processing issues

The n8n webhook endpoint is designed to be robust and user-friendly, providing a seamless integration between n8n workflows and LightRAG's document processing capabilities. 