# Supabase Migration Guide for LightRAG

## 🚀 **Complete Migration Steps**

### **Step 1: Create Supabase Project**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Enter project details:**
   - **Name**: `lightrag-production`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. **Click "Create new project"**
5. **Wait for setup to complete** (2-3 minutes)

### **Step 2: Get Connection Details**

1. **Go to your Supabase project dashboard**
2. **Click "Settings" → "Database"**
3. **Copy these details:**
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (the one you created)

### **Step 3: Install Required Extensions**

1. **Go to "SQL Editor" in Supabase**
2. **Run these commands:**

```sql
-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable AGE extension for graph storage (if needed)
CREATE EXTENSION IF NOT EXISTS age;
```

### **Step 4: Update Railway Environment Variables**

In your Railway LightRAG service, **remove** these variables:
```bash
# REMOVE these Railway PostgreSQL variables
PGHOST
PGPORT
PGUSER
PGPASSWORD
PGDATABASE
DATABASE_URL
```

**Add** these Supabase variables:
```bash
# Supabase PostgreSQL Configuration
POSTGRES_HOST=db.xxxxxxxxxxxxx.supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_supabase_password
POSTGRES_DATABASE=postgres
POSTGRES_WORKSPACE=default
POSTGRES_MAX_CONNECTIONS=12

# Optional: Add Supabase URL for reference
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
```

### **Step 5: Complete Railway Variables**

Your complete Railway environment variables should be:

```bash
# Server Configuration
HOST=0.0.0.0
PORT=8080
WEBUI_TITLE='LightRAG API'
WEBUI_DESCRIPTION="Simple and Fast RAG System"

# Authentication
AUTH_ACCOUNTS='admin:your_secure_password_here'
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

# Supabase PostgreSQL Configuration
POSTGRES_HOST=db.xxxxxxxxxxxxx.supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_supabase_password
POSTGRES_DATABASE=postgres
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

# CORS Configuration
CORS_ORIGINS=https://augentik.com,https://www.augentik.com,https://lightrag-production-6328.up.railway.app
```

### **Step 6: Test Connection Locally**

1. **Create a `.env` file** with your Supabase credentials
2. **Run the test script:**
   ```bash
   python test_supabase_connection.py
   ```

### **Step 7: Deploy to Railway**

1. **Save all environment variables in Railway**
2. **Railway will automatically redeploy**
3. **Monitor the logs for successful connection**

### **Step 8: Verify Deployment**

1. **Test the health endpoint:**
   ```bash
   curl https://lightrag-production-6328.up.railway.app/health
   ```

2. **Test the detailed health endpoint:**
   ```bash
   curl https://lightrag-production-6328.up.railway.app/health/detailed
   ```

## 🎯 **Expected Results**

After successful migration, you should see:
- ✅ **Successful PostgreSQL connection** in logs
- ✅ **Health endpoints responding** correctly
- ✅ **Vector extension working** for embeddings
- ✅ **All LightRAG features** functioning normally

## 🔧 **Troubleshooting**

### **Connection Issues**
- **Check IP whitelist** in Supabase settings
- **Verify credentials** are correct
- **Ensure extensions** are installed

### **Performance Issues**
- **Adjust connection pool size** (`POSTGRES_MAX_CONNECTIONS`)
- **Monitor Supabase usage** in dashboard
- **Consider upgrading** Supabase plan if needed

## 📝 **Benefits of Supabase**

- ✅ **Better reliability** than Railway PostgreSQL
- ✅ **Built-in vector support** with pgvector
- ✅ **Real-time subscriptions** (if needed later)
- ✅ **Better monitoring** and analytics
- ✅ **Automatic backups** and point-in-time recovery
- ✅ **Row Level Security** (RLS) for data protection

## 🚀 **Next Steps**

1. **Complete the migration**
2. **Test all functionality**
3. **Monitor performance**
4. **Consider enabling RLS** for production security
5. **Set up monitoring** and alerts
