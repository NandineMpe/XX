    # Build stage
    FROM public.ecr.aws/docker/library/python:3.11-slim AS builder

    WORKDIR /app

    # Install Rust and required build dependencies
    RUN apt-get update && apt-get install -y \
        curl \
        build-essential \
        pkg-config \
        && rm -rf /var/lib/apt/lists/* \
        && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
        && . $HOME/.cargo/env

    # Copy only requirements files first to leverage Docker cache
    COPY requirements.txt .
    COPY lightrag/api/requirements.txt ./lightrag/api/

    # Install dependencies
    ENV PATH="/root/.cargo/bin:${PATH}"
    RUN pip install --user --no-cache-dir -r requirements.txt
    RUN pip install --user --no-cache-dir -r lightrag/api/requirements.txt

    # Install depndencies for default storage
    RUN pip install --user --no-cache-dir nano-vectordb networkx
    # Install depndencies for default LLM
    RUN pip install --user --no-cache-dir openai ollama tiktoken
    # Install depndencies for default document loader
    RUN pip install --user --no-cache-dir pypdf2 python-docx python-pptx openpyxl

    # Final stage
    FROM public.ecr.aws/docker/library/python:3.11-slim

    # Install curl for healthcheck
    RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

    WORKDIR /app

    # Copy only necessary files from builder
    COPY --from=builder /root/.local /root/.local
    COPY ./lightrag ./lightrag
    COPY setup.py .

    RUN pip install ".[api]"
    # Make sure scripts in .local are usable
    ENV PATH=/root/.local/bin:$PATH

    # Materialize legacy asset aliases defined in the manifest for cache-busted filenames
    RUN python - <<'PY'
        from pathlib import Path
        from lightrag.api.asset_manifest import materialize_aliases
        assets_dir = Path("/app/lightrag/api/webui/assets")
        materialize_aliases(assets_dir)
    PY

    # Create necessary directories
    RUN mkdir -p /app/data/rag_storage /app/data/inputs

    # Docker data directories
    ENV WORKING_DIR=/app/data/rag_storage
    ENV INPUT_DIR=/app/data/inputs

    # Expose the default port
    EXPOSE 9621

    # Add healthcheck
    HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
        CMD curl -f http://localhost:9621/health || exit 1

    # Set entrypoint
    ENTRYPOINT ["python", "-m", "lightrag.api.lightrag_server"]
