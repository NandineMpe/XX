from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger("lightrag")

_MANIFEST_FILENAME = "asset-manifest.json"


def _manifest_path() -> Path:
    return Path(__file__).parent / _MANIFEST_FILENAME


@dataclass(frozen=True)
class AssetManifest:
    entry_js: str | None = None
    entry_css: list[str] = field(default_factory=list)
    legacy_entry_aliases: list[str] = field(default_factory=list)

    def entry_path(self, base: Path) -> Path | None:
        if not self.entry_js:
            return None
        return base / self.entry_js

    def alias_map(self) -> dict[str, str]:
        if not self.entry_js:
            return {}
        return {
            alias: self.entry_js
            for alias in self.legacy_entry_aliases
            if alias and alias != self.entry_js
        }

    def to_dict(self) -> dict[str, object]:
        return {
            "entry_js": self.entry_js,
            "entry_css": list(self.entry_css),
            "legacy_entry_aliases": list(self.legacy_entry_aliases),
        }


@lru_cache(maxsize=1)
def load_asset_manifest() -> AssetManifest:
    manifest_path = _manifest_path()
    if not manifest_path.exists():
        return AssetManifest()
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as err:
        logger.debug("Failed to load asset manifest: %s", err)
        return AssetManifest()
    return AssetManifest(
        entry_js=data.get("entry_js"),
        entry_css=list(data.get("entry_css") or []),
        legacy_entry_aliases=list(data.get("legacy_entry_aliases") or []),
    )


def save_asset_manifest(manifest: AssetManifest) -> None:
    manifest_path = _manifest_path()
    manifest_path.write_text(
        json.dumps(manifest.to_dict(), indent=2) + "\n", encoding="utf-8"
    )
    load_asset_manifest.cache_clear()
    load_asset_manifest()


def materialize_aliases(assets_dir: Path) -> None:
    assets_dir.mkdir(parents=True, exist_ok=True)
    manifest = load_asset_manifest()
    for requested, existing in manifest.alias_map().items():
        requested_path = assets_dir / requested
        existing_path = assets_dir / existing
        if not existing_path.exists():
            logger.debug(
                "Asset alias skipped: %s -> %s (target missing)", requested, existing
            )
            continue
        if requested_path.exists() or requested_path == existing_path:
            continue
        try:
            requested_path.write_bytes(existing_path.read_bytes())
        except Exception as err:
            logger.debug(
                "Failed to materialize alias %s -> %s: %s", requested, existing, err
            )
