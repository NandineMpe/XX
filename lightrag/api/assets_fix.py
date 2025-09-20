from fastapi import APIRouter
from fastapi.responses import FileResponse, Response
from pathlib import Path

from .asset_manifest import load_asset_manifest

router = APIRouter()


@router.get("/assets/{file_path:path}")
async def serve_assets_alias(file_path: str):
    """Serve assets while allowing legacy bundle aliases via the manifest."""
    base_dir = Path(__file__).parent / "webui" / "assets"
    actual_path = base_dir / file_path
    if actual_path.exists():
        return FileResponse(actual_path)

    manifest = load_asset_manifest()
    alias_target = manifest.alias_map().get(file_path)
    if alias_target:
        fallback_path = base_dir / alias_target
        if fallback_path.exists():
            return FileResponse(fallback_path)

    return Response(status_code=404)
