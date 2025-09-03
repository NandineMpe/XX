#!/usr/bin/env python3
"""
Debug script for Railway deployment issues
"""

import os
from urllib.parse import urlparse


def check_environment_variables():
    """Check and display all relevant environment variables"""
    print("🔍 Checking Railway Environment Variables")
    print("=" * 50)

    # Railway PostgreSQL variables
    railway_vars = [
        "DATABASE_URL",
        "PGHOST",
        "PGPORT",
        "PGUSER",
        "PGPASSWORD",
        "PGDATABASE",
    ]

    # LightRAG PostgreSQL variables
    lightrag_vars = [
        "POSTGRES_HOST",
        "POSTGRES_PORT",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DATABASE",
        "POSTGRES_WORKSPACE",
        "POSTGRES_MAX_CONNECTIONS",
    ]

    # Server variables
    server_vars = ["HOST", "PORT", "LLM_BINDING_API_KEY", "EMBEDDING_BINDING_API_KEY"]

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

    print("\n" + "=" * 50)


def parse_database_url():
    """Parse DATABASE_URL if present"""
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        print("🔗 Parsing DATABASE_URL:")
        try:
            parsed = urlparse(database_url)
            print(f"  Host: {parsed.hostname}")
            print(f"  Port: {parsed.port}")
            print(f"  User: {parsed.username}")
            print(
                f"  Password: {'*' * len(parsed.password) if parsed.password else 'None'}"
            )
            print(f"  Database: {parsed.path.lstrip('/')}")
        except Exception as e:
            print(f"  ❌ Failed to parse DATABASE_URL: {e}")
    else:
        print("  ❌ DATABASE_URL not found")


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


def main():
    """Main function"""
    print("🚀 Railway Deployment Debug Tool")
    print("=" * 50)

    check_environment_variables()
    parse_database_url()
    check_port_conflicts()

    print("\n📋 Recommendations:")
    print("1. Ensure PORT=8080 is set in Railway environment variables")
    print("2. Make sure PostgreSQL service is added to your Railway project")
    print("3. Verify all required API keys are set")
    print("4. Check Railway logs for detailed error messages")

    print("\n🔄 To restart deployment:")
    print("1. Go to your Railway project dashboard")
    print("2. Click on your service")
    print("3. Go to 'Deployments' tab")
    print("4. Click 'Redeploy' or 'Deploy'")
    print("5. Monitor the build logs for errors")


if __name__ == "__main__":
    main()
