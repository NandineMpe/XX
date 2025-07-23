# Healthcheck Endpoints

LightRAG provides several healthcheck endpoints for monitoring and container orchestration.

## Available Endpoints

### 1. `/health` - Basic Health Check

**Purpose**: Basic health check for load balancers and monitoring systems
**Authentication**: Not required
**Method**: GET

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.123456",
  "service": "LightRAG API",
  "version": "1.0.0",
  "storage_status": {
    "kv_storage": true,
    "vector_storage": true,
    "graph_storage": true,
    "doc_status_storage": true
  }
}
```

**HTTP Status Codes**:
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is unhealthy

### 2. `/ready` - Readiness Check

**Purpose**: Kubernetes readiness probe endpoint
**Authentication**: Not required
**Method**: GET

**Response**:
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00.123456",
  "service": "LightRAG API"
}
```

**HTTP Status Codes**:
- `200 OK`: Service is ready to accept requests
- `503 Service Unavailable`: Service is not ready (e.g., databases not connected)

### 3. `/health/detailed` - Detailed Health Status

**Purpose**: Detailed system status with configuration information
**Authentication**: Required
**Method**: GET

**Response**:
```json
{
  "status": "healthy",
  "working_directory": "/app/data/rag_storage",
  "input_directory": "/app/data/inputs",
  "configuration": {
    "llm_binding": "openai",
    "llm_binding_host": "https://api.openai.com",
    "llm_model": "gpt-3.5-turbo",
    "embedding_binding": "openai",
    "embedding_binding_host": "https://api.openai.com",
    "embedding_model": "text-embedding-ada-002",
    "max_tokens": 32768,
    "kv_storage": "json",
    "doc_status_storage": "json",
    "graph_storage": "networkx",
    "vector_storage": "nano_vector_db",
    "enable_llm_cache_for_extract": true,
    "enable_llm_cache": true
  },
  "auth_mode": "enabled",
  "pipeline_busy": false,
  "core_version": "1.0.0",
  "api_version": "1.0.0",
  "webui_title": "LightRAG",
  "webui_description": "Simple and Fast RAG"
}
```

**HTTP Status Codes**:
- `200 OK`: Detailed status available
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Error retrieving detailed status

## Usage Examples

### Docker Healthcheck

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9621/health || exit 1
```

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 9621
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 9621
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Monitoring with curl

```bash
# Basic health check
curl -f http://localhost:9621/health

# Readiness check
curl -f http://localhost:9621/ready

# Detailed status (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:9621/health/detailed
```

### Testing with Python

```python
import requests

# Test basic health
response = requests.get("http://localhost:9621/health")
if response.status_code == 200:
    print("Service is healthy")
    print(response.json())

# Test readiness
response = requests.get("http://localhost:9621/ready")
if response.status_code == 200:
    print("Service is ready")
```

## Configuration

The healthcheck endpoints are automatically available when running the LightRAG API server. No additional configuration is required.

### Environment Variables

The healthcheck endpoints respect the following environment variables:

- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 9621)

### Railway Configuration

For Railway deployments, the healthcheck is configured in `railway.json`:

```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

## Best Practices

1. **Use `/health` for basic monitoring**: This endpoint is lightweight and doesn't require authentication
2. **Use `/ready` for Kubernetes**: This endpoint checks if the service is truly ready to accept requests
3. **Use `/health/detailed` for debugging**: This endpoint provides detailed information but requires authentication
4. **Set appropriate timeouts**: Health checks should be quick (5-10 seconds)
5. **Monitor storage status**: The health check includes storage connectivity information

## Troubleshooting

### Health Check Fails

1. Check if the service is running: `curl http://localhost:9621/health`
2. Check logs for errors
3. Verify database connections
4. Check if all required environment variables are set

### Readiness Check Fails

1. Verify all storage systems are connected
2. Check if the application has finished initialization
3. Review the startup logs
4. Ensure all dependencies are available

### Detailed Health Check Requires Authentication

This is expected behavior. The detailed endpoint requires authentication to protect sensitive configuration information. 