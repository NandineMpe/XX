#!/usr/bin/env python3
"""
Enhanced debug script for Railway deployment issues
"""

import os
import sys
import asyncio
from urllib.parse import urlparse

def check_environment_variables():
    """Check and display all relevant environment variables"""
    print("🔍 Enhanced Railway Environment Variables Check")
    print("=" * 60)
    
    # Railway PostgreSQL variables
    railway_vars = [
        "DATABASE_URL",
        "PGHOST", 
        "PGPORT",
        "PGUSER",
        "PGPASSWORD",
        "PGDATABASE"
    ]
    
    # LightRAG PostgreSQL variables
    lightrag_vars = [
        "POSTGRES_HOST",
        "POSTGRES_PORT", 
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DATABASE",
        "POSTGRES_WORKSPACE",
        "POSTGRES_MAX_CONNECTIONS"
    ]
    
    # Server variables
    server_vars = [
        "HOST",
        "PORT",
        "LLM_BINDING_API_KEY",
        "EMBEDDING_BINDING_API_KEY"
    ]
    
    print("🚂 Railway PostgreSQL Variables:")
    for var in railway_vars:
        value = os.environ.get(var)
        if value:
            if "PASSWORD" in var:
                print(f"  {var}: {'*' * len(value)}")
            else:
                print(f"  {var}: {value}")
        else:
            print(f"  {var}: ❌ Not set")
    
    print("\n🔧 LightRAG PostgreSQL Variables:")
    for var in lightrag_vars:
        value = os.environ.get(var)
        if value:
            if "PASSWORD" in var:
                print(f"  {var}: {'*' * len(value)}")
            else:
                print(f"  {var}: {value}")
        else:
            print(f"  {var}: ❌ Not set")
    
    print("\n🌐 Server Variables:")
    for var in server_vars:
        value = os.environ.get(var)
        if value:
            if "API_KEY" in var:
                print(f"  {var}: {'*' * len(value)}")
            else:
                print(f"  {var}: {value}")
        else:
            print(f"  {var}: ❌ Not set")
    
    print("\n" + "=" * 60)

def parse_database_url():
    """Parse DATABASE_URL if present"""
    print("\n🔗 DATABASE_URL Analysis:")
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        try:
            parsed = urlparse(database_url)
            print(f"  Host: {parsed.hostname}")
            print(f"  Port: {parsed.port}")
            print(f"  User: {parsed.username}")
            print(f"  Database: {parsed.path.lstrip('/')}")
            print(f"  Scheme: {parsed.scheme}")
        except Exception as e:
            print(f"  ❌ Error parsing DATABASE_URL: {e}")
    else:
        print("  ❌ DATABASE_URL not set")

def check_port_conflicts():
    """Check for potential port conflicts"""
    print("\n🚨 Port Conflict Check:")
    port = os.environ.get("PORT", "8080")
    print(f"  Application Port: {port}")
    
    # Check if any PostgreSQL variables are using the same port
    pg_port = os.environ.get("PGPORT") or os.environ.get("POSTGRES_PORT", "5432")
    print(f"  PostgreSQL Port: {pg_port}")
    
    if port == pg_port:
        print("  ⚠️  WARNING: Application and PostgreSQL are using the same port!")
    else:
        print("  ✅ No port conflict detected")

async def test_postgres_connection():
    """Test PostgreSQL connection with current environment variables"""
    print("\n🔌 PostgreSQL Connection Test:")
    
    try:
        import asyncpg
        
        # Get connection details
        host = os.environ.get("PGHOST") or os.environ.get("POSTGRES_HOST", "localhost")
        port = int(os.environ.get("PGPORT") or os.environ.get("POSTGRES_PORT", "5432"))
        user = os.environ.get("PGUSER") or os.environ.get("POSTGRES_USER", "postgres")
        password = os.environ.get("PGPASSWORD") or os.environ.get("POSTGRES_PASSWORD")
        database = os.environ.get("PGDATABASE") or os.environ.get("POSTGRES_DATABASE", "postgres")
        
        print(f"  Attempting connection to: {host}:{port}/{database}")
        print(f"  User: {user}")
        print(f"  Password: {'*' * len(password) if password else 'None'}")
        
        if not password:
            print("  ❌ No password provided")
            return
        
        # Try to connect
        conn = await asyncpg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            timeout=10
        )
        
        print("  ✅ Connection successful!")
        
        # Test a simple query
        result = await conn.fetchval("SELECT version()")
        print(f"  PostgreSQL version: {result[:50]}...")
        
        await conn.close()
        
    except ImportError:
        print("  ❌ asyncpg not available")
    except Exception as e:
        print(f"  ❌ Connection failed: {e}")

def check_lightrag_config():
    """Check LightRAG configuration"""
    print("\n⚙️  LightRAG Configuration Check:")
    
    # Check storage configuration
    kv_storage = os.environ.get("LIGHTRAG_KV_STORAGE", "Not set")
    vector_storage = os.environ.get("LIGHTRAG_VECTOR_STORAGE", "Not set")
    graph_storage = os.environ.get("LIGHTRAG_GRAPH_STORAGE", "Not set")
    doc_status_storage = os.environ.get("LIGHTRAG_DOC_STATUS_STORAGE", "Not set")
    
    print(f"  KV Storage: {kv_storage}")
    print(f"  Vector Storage: {vector_storage}")
    print(f"  Graph Storage: {graph_storage}")
    print(f"  Doc Status Storage: {doc_status_storage}")
    
    # Check if using PostgreSQL for all storage
    if "PG" in kv_storage and "PG" in vector_storage and "PG" in graph_storage and "PG" in doc_status_storage:
        print("  ✅ All storage configured for PostgreSQL")
    else:
        print("  ⚠️  Mixed storage configuration detected")

async def main():
    """Main debug function"""
    print("🚀 Enhanced Railway Debug Script")
    print("=" * 60)
    
    check_environment_variables()
    parse_database_url()
    check_port_conflicts()
    check_lightrag_config()
    
    try:
        await test_postgres_connection()
    except Exception as e:
        print(f"  ❌ Connection test failed: {e}")
    
    print("\n" + "=" * 60)
    print("🔍 Debug complete!")

if __name__ == "__main__":
    asyncio.run(main()) 