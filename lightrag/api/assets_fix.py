from fastapi import APIRouter
from fastapi.responses import FileResponse, Response
from pathlib import Path


router = APIRouter()


@router.get("/assets/{file_path:path}")
async def serve_assets_alias(file_path: str):
    """Serve files from /webui/assets when requested from /assets.

    This provides a robust alias so that cache-busted bundle paths requested
    under /assets/* are transparently served from the packaged
    lightrag/api/webui/assets directory.
    """
    actual_path = Path(__file__).parent / "webui" / "assets" / file_path
    if actual_path.exists():
        # Rely on uvicorn to stream the file efficiently
        return FileResponse(actual_path)
    return Response(status_code=404)
