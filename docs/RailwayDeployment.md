# Railway Deployment Guide

This guide will help you deploy LightRAG on Railway with PostgreSQL as the backend database.

## Prerequisites

1. A Railway account
2. OpenAI API key (or other LLM provider)
3. Git repository with your LightRAG code

## Step 1: Set Up Railway Project

1. **Create a new Railway project**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"

2. **Connect your GitHub repository**
   - Select your LightRAG repository
   - Railway will automatically detect it's a Python project

## Step 2: Add PostgreSQL Service

1. **Add PostgreSQL database**
   - In your Railway project, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create a PostgreSQL instance

2. **Note the connection details**
   - Railway will provide environment variables like:
     - `DATABASE_URL`
     - `PGHOST`
     - `PGPORT`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`

## Step 3: Configure Environment Variables

In your Railway project settings, add the following environment variables:

### Required Variables

```bash
# Server Configuration
HOST=0.0.0.0
PORT=8080
WEBUI_TITLE='LightRAG API'
WEBUI_DESCRIPTION="Simple and Fast RAG System"

# Authentication
AUTH_ACCOUNTS='admin:your_secure_password'
TOKEN_SECRET=your-secure-token-secret-here
TOKEN_EXPIRE_HOURS=48
GUEST_TOKEN_EXPIRE_HOURS=24
JWT_ALGORITHM=HS256

# LLM Configuration
LLM_BINDING=openai
LLM_MODEL=gpt-4o
LLM_BINDING_HOST=https://api.openai.com/v1
LLM_BINDING_API_KEY=your_openai_api_key_here
MAX_TOKENS=32768
TIMEOUT=240
TEMPERATURE=0
MAX_ASYNC=4

# Embedding Configuration
EMBEDDING_BINDING=openai
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIM=3072
EMBEDDING_BINDING_API_KEY=your_openai_api_key_here

# Storage Configuration - PostgreSQL
LIGHTRAG_KV_STORAGE=PGKVStorage
LIGHTRAG_VECTOR_STORAGE=PGVectorStorage
LIGHTRAG_GRAPH_STORAGE=PGGraphStorage
LIGHTRAG_DOC_STATUS_STORAGE=PGDocStatusStorage

# PostgreSQL Configuration
POSTGRES_WORKSPACE=default
POSTGRES_MAX_CONNECTIONS=12

# RAG Configuration
SUMMARY_LANGUAGE=English
ENABLE_LLM_CACHE=true
ENABLE_LLM_CACHE_FOR_EXTRACT=true
COSINE_THRESHOLD=0.2
TOP_K=60
MAX_PARALLEL_INSERT=2
CHUNK_SIZE=1200
CHUNK_OVERLAP_SIZE=100

# Logging
LOG_LEVEL=INFO
VERBOSE=False
```

### Important Notes

1. **Port Configuration**: We use port `8080` instead of `9621` to avoid conflicts with Railway's PostgreSQL port assignment.

2. **PostgreSQL Variables**: Railway automatically provides PostgreSQL connection variables. You don't need to set them manually.

3. **API Keys**: Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Step 4: Deploy

1. **Push your changes to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Railway deployment"
   git push origin main
   ```

2. **Railway will automatically deploy**
   - Railway will detect the changes and start a new deployment
   - Monitor the build logs for any issues

## Step 5: Verify Deployment

1. **Check the deployment logs**
   - Go to your Railway project
   - Click on the deployment
   - Check the logs for any errors

2. **Test the health endpoint**
   ```bash
   curl https://your-railway-app.railway.app/health
   ```

3. **Test the detailed health endpoint**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://your-railway-app.railway.app/health/detailed
   ```

## Troubleshooting

### Common Issues

1. **Port Conflict Error**
   ```
   ERROR: PostgreSQL, Failed to connect database at gondola.proxy.rlwy.net:9621/railway
   ```
   **Solution**: Ensure `PORT=8080` is set in your environment variables.

2. **PostgreSQL Connection Failed**
   ```
   ERROR: PostgreSQL, Failed to connect database
   ```
   **Solution**: 
   - Check that Railway PostgreSQL service is running
   - Verify environment variables are correctly set
   - Ensure PostgreSQL extensions are installed

3. **Missing Dependencies**
   ```
   ModuleNotFoundError: No module named 'asyncpg'
   ```
   **Solution**: The dependencies should be automatically installed. Check that `requirements.txt` is in your repository.

### PostgreSQL Extensions

Railway PostgreSQL may need the `vector` extension for pgvector. You can install it via:

1. **Connect to your PostgreSQL database**
   ```bash
   # Get connection details from Railway
   psql $DATABASE_URL
   ```

2. **Install the vector extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Install the AGE extension (if using graph storage)**
   ```sql
   CREATE EXTENSION IF NOT EXISTS age;
   ```

## Environment Variables Reference

### Server Configuration
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8080 for Railway)
- `WEBUI_TITLE`: Title for the web interface
- `WEBUI_DESCRIPTION`: Description for the web interface

### Authentication
- `AUTH_ACCOUNTS`: Comma-separated username:password pairs
- `TOKEN_SECRET`: Secret key for JWT tokens
- `TOKEN_EXPIRE_HOURS`: Token expiration time
- `GUEST_TOKEN_EXPIRE_HOURS`: Guest token expiration time

### LLM Configuration
- `LLM_BINDING`: LLM provider (openai, ollama, etc.)
- `LLM_MODEL`: Model name
- `LLM_BINDING_HOST`: API host URL
- `LLM_BINDING_API_KEY`: API key
- `MAX_TOKENS`: Maximum tokens for responses
- `TIMEOUT`: Request timeout in seconds

### Embedding Configuration
- `EMBEDDING_BINDING`: Embedding provider
- `EMBEDDING_MODEL`: Embedding model name
- `EMBEDDING_DIM`: Embedding dimensions
- `EMBEDDING_BINDING_API_KEY`: API key

### Storage Configuration
- `LIGHTRAG_KV_STORAGE`: Key-value storage type
- `LIGHTRAG_VECTOR_STORAGE`: Vector storage type
- `LIGHTRAG_GRAPH_STORAGE`: Graph storage type
- `LIGHTRAG_DOC_STATUS_STORAGE`: Document status storage type

### PostgreSQL Configuration
- `POSTGRES_WORKSPACE`: Workspace name
- `POSTGRES_MAX_CONNECTIONS`: Maximum database connections

## Monitoring

1. **Health Checks**: Railway will automatically check `/health` endpoint
2. **Logs**: Monitor application logs in Railway dashboard
3. **Metrics**: Use Railway's built-in metrics to monitor performance

## Scaling

1. **Vertical Scaling**: Increase CPU/Memory in Railway settings
2. **Horizontal Scaling**: Railway supports multiple instances
3. **Database Scaling**: Upgrade PostgreSQL plan as needed

## Security

1. **Environment Variables**: Never commit sensitive data to Git
2. **Authentication**: Use strong passwords and secure tokens
3. **HTTPS**: Railway provides automatic HTTPS
4. **CORS**: Configure CORS origins appropriately

## Cost Optimization

1. **LLM Caching**: Enable `ENABLE_LLM_CACHE=true`
2. **Database Connections**: Optimize `POSTGRES_MAX_CONNECTIONS`
3. **Resource Limits**: Monitor and adjust Railway resource allocation 