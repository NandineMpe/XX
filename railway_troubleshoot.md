# Railway Deployment Troubleshooting Guide

## 🚨 Common Deployment Failures

### 1. PostgreSQL Connection Issues

**Symptoms:**
```
ERROR: PostgreSQL, Failed to connect database at [host]:[port]/[database]
```

**Solutions:**
- Ensure PostgreSQL service is added to your Railway project
- Check that environment variables are set correctly
- Verify the PostgreSQL service is running

### 2. Port Conflicts

**Symptoms:**
```
Address already in use
Port 9621 is already in use
```

**Solutions:**
- Ensure `PORT=8080` is set in Railway environment variables
- Check that no other services are using the same port

### 3. Missing Dependencies

**Symptoms:**
```
ModuleNotFoundError: No module named 'asyncpg'
```

**Solutions:**
- Ensure `requirements.txt` is in your repository
- Check that all dependencies are listed

### 4. Environment Variable Issues

**Symptoms:**
```
Missing database user, password, or database
```

**Solutions:**
- Set all required environment variables in Railway
- Use the debug script to verify variables

## 🔍 Step-by-Step Debugging

### Step 1: Check Environment Variables

Run this locally to see what variables are available:

```bash
python railway_debug.py
```

### Step 2: Verify Railway Configuration

1. **Go to your Railway project**
2. **Click on your service**
3. **Go to "Variables" tab**
4. **Ensure these are set:**

```bash
# Required Variables
PORT=8080
LLM_BINDING_API_KEY=your_openai_api_key
EMBEDDING_BINDING_API_KEY=your_openai_api_key

# Optional but recommended
HOST=0.0.0.0
WEBUI_TITLE='LightRAG API'
WEBUI_DESCRIPTION="Simple and Fast RAG System"
AUTH_ACCOUNTS='admin:your_password'
TOKEN_SECRET=your_secure_secret
```

### Step 3: Check PostgreSQL Service

1. **Go to your Railway project**
2. **Click "New Service"**
3. **Select "Database" → "PostgreSQL"**
4. **Wait for it to be provisioned**

### Step 4: Review Deployment Logs

Look for these specific error patterns:

#### PostgreSQL Connection Error
```
ERROR: PostgreSQL, Failed to connect database
```
**Fix:** Add PostgreSQL service to Railway project

#### Port Error
```
Address already in use
```
**Fix:** Set `PORT=8080` in environment variables

#### Module Error
```
ModuleNotFoundError
```
**Fix:** Ensure `requirements.txt` is in repository

#### Environment Variable Error
```
Missing database user, password, or database
```
**Fix:** Set PostgreSQL environment variables

## 🛠️ Manual Fixes

### Fix 1: Add PostgreSQL Service

1. In Railway dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Wait for provisioning to complete
4. Railway will automatically provide environment variables

### Fix 2: Set Environment Variables

In Railway service settings, add these variables:

```bash
# Server Configuration
PORT=8080
HOST=0.0.0.0

# LLM Configuration
LLM_BINDING=openai
LLM_MODEL=gpt-4o
LLM_BINDING_HOST=https://api.openai.com/v1
LLM_BINDING_API_KEY=your_openai_api_key

# Embedding Configuration
EMBEDDING_BINDING=openai
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIM=3072
EMBEDDING_BINDING_API_KEY=your_openai_api_key

# Storage Configuration
LIGHTRAG_KV_STORAGE=PGKVStorage
LIGHTRAG_VECTOR_STORAGE=PGVectorStorage
LIGHTRAG_GRAPH_STORAGE=PGGraphStorage
LIGHTRAG_DOC_STATUS_STORAGE=PGDocStatusStorage
```

### Fix 3: Force Redeploy

1. Go to Railway service
2. Click "Deployments" tab
3. Click "Redeploy" or "Deploy"
4. Monitor logs for errors

## 📋 Checklist

- [ ] PostgreSQL service added to Railway project
- [ ] `PORT=8080` set in environment variables
- [ ] OpenAI API keys configured
- [ ] All required environment variables set
- [ ] `requirements.txt` present in repository
- [ ] No port conflicts
- [ ] PostgreSQL service is running

## 🆘 Emergency Reset

If all else fails:

1. **Delete the current Railway service**
2. **Create a new Railway project**
3. **Add PostgreSQL service first**
4. **Deploy your code**
5. **Set environment variables**
6. **Redeploy**

## 📞 Getting Help

If you're still having issues:

1. **Share the complete deployment logs**
2. **Run `python railway_debug.py` and share output**
3. **Check Railway status page for any outages**
4. **Verify your OpenAI API keys are valid**
