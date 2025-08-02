# n8n Workflow Integration Guide

## Overview

This document outlines the integration between the Augentik Frontend and the n8n workflow system for automated document retrieval. The integration allows auditors to request documents through the Process Walkthrough Library, which triggers an n8n workflow that handles the document retrieval process.

## Architecture

```
Frontend (React) → n8n Webhook → n8n Workflow → Document Retrieval → API Response
```

### Components

1. **Process Walkthrough Library** (`src/features/ProcessWalkthroughLibrary.tsx`)
   - UI for requesting documents during process walkthroughs
   - Sends webhook requests to n8n

2. **Document Request Store** (`src/stores/documentRequests.ts`)
   - Manages document request state
   - Handles webhook communication
   - Provides real-time status updates

3. **Document Retrieval Dashboard** (`src/features/DocumentRetrievalDashboard.tsx`)
   - Displays all document requests
   - Shows real-time status updates
   - Allows document downloads

4. **n8n Test Panel** (`src/components/ui/n8n-test-panel.tsx`)
   - Development tool for testing webhook integration
   - Provides debugging information

## API Endpoints

### Webhook Endpoint
- **URL**: `https://primary-production-1d298.up.railway.app/webhook/426951f9-1936-44c3-83ae-8f52f0508acf`
- **Method**: POST
- **Headers**: 
  - `X-API-Key: admin123`
  - `Content-Type: application/json`

### Request Format
```json
{
  "documentType": "Document Name",
  "description": "Document description",
  "parameters": {
    "auditor": "Sam Salt",
    "entity": "Ornua",
    "process": "Business Model",
    "step": "Dairy Procurement",
    "source_trigger": "Walkthrough"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "unique-request-id"
}
```

### API Endpoint
- **URL**: `https://primary-production-1d298.up.railway.app/webhook/api/document-requests`
- **Method**: GET
- **Headers**: 
  - `X-API-Key: admin123`
  - `Content-Type: application/json`

### Response Format
```json
{
  "requests": [
    {
      "requestId": "unique-id",
      "status": "Requested|In Progress|Ready|Failed",
      "documentType": "Document Name",
      "parameters": { ... },
      "downloadUrl": "https://...",
      "fileName": "document.pdf",
      "fileSize": "1.2MB",
      "errorMessage": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Status Mapping

The frontend maps n8n workflow statuses to user-friendly statuses:

| n8n Status | Frontend Status | Description |
|------------|----------------|-------------|
| `Requested` | `Requested` | Initial request submitted |
| `In Progress` | `Auto-Retrieval in Progress` | n8n workflow is processing |
| `Processing` | `Auto-Retrieval in Progress` | Alternative processing status |
| `Waiting for Client Email Approval` | `Waiting for Client Email Approval` | Awaiting client approval |
| `Client Approved via Email` | `Client Approved via Email` | Client has approved |
| `Sent to Auditor` | `Sent to Auditor` | Document sent to auditor |
| `Ready` | `Ready` | Document ready for download |
| `Completed` | `Ready` | Alternative completion status |
| `Failed` | `Failed / Needs Manual Intervention` | Workflow failed |
| `Error` | `Failed / Needs Manual Intervention` | Alternative error status |

## Features

### Real-time Updates
- Automatic polling every 30 seconds for active requests
- Manual refresh capability
- Optimistic UI updates for immediate feedback

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Fallback request objects for corrupted data

### Document Management
- Automatic file download handling
- Support for multiple file formats
- File size and metadata display

## Testing

### Development Test Panel
The n8n Test Panel (only visible in development) provides:
- Webhook testing functionality
- API endpoint testing
- Real-time status monitoring
- Debug information display

### Manual Testing
1. Navigate to Process Walkthrough Library
2. Select a process and step
3. Click "Request Document" on any document
4. Check Document Retrieval Dashboard for status updates
5. Use test panel for debugging if needed

## Troubleshooting

### Common Issues

1. **Webhook Not Responding**
   - Check network connectivity
   - Verify API key is correct
   - Check n8n workflow status

2. **Requests Not Appearing**
   - Check API endpoint connectivity
   - Verify request format
   - Check browser console for errors

3. **Status Not Updating**
   - Check polling interval
   - Verify n8n workflow is running
   - Check for JavaScript errors

### Debug Steps

1. Open browser developer tools
2. Check Network tab for failed requests
3. Check Console tab for error messages
4. Use n8n Test Panel for detailed debugging
5. Verify n8n workflow logs

## Configuration

### Environment Variables
```bash
# Development
VITE_BACKEND_URL=http://localhost:9621
VITE_API_PROXY=true

# Production
VITE_BACKEND_URL=https://primary-production-1d298.up.railway.app
```

### Webhook Configuration
- **Webhook URL**: Configured in n8n workflow
- **API Key**: `admin123` (should be moved to environment variables)
- **Timeout**: 30 seconds
- **Retry Logic**: 3 attempts with exponential backoff

## Security Considerations

1. **API Key Management**
   - Move API key to environment variables
   - Implement proper key rotation
   - Use HTTPS for all communications

2. **Data Validation**
   - Validate all incoming webhook data
   - Sanitize user inputs
   - Implement rate limiting

3. **Error Handling**
   - Don't expose sensitive information in error messages
   - Log errors securely
   - Implement proper error boundaries

## Future Enhancements

1. **WebSocket Integration**
   - Real-time status updates without polling
   - Reduced server load
   - Better user experience

2. **Advanced Filtering**
   - Date range filtering
   - Status-based filtering
   - Search functionality

3. **Bulk Operations**
   - Bulk document requests
   - Batch processing
   - Progress tracking

4. **Audit Trail**
   - Detailed request history
   - User action logging
   - Compliance reporting

## Support

For issues with the n8n workflow integration:
1. Check this documentation
2. Review browser console logs
3. Test with the n8n Test Panel
4. Contact the development team with specific error messages 