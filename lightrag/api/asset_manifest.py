from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger("lightrag")

_MANIFEST_FILENAME = "asset-manifest.json"


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


@lru_cache(maxsize=1)
def load_asset_manifest() -> AssetManifest:
    manifest_path = Path(__file__).parent / _MANIFEST_FILENAME
    if not manifest_path.exists():
        return AssetManifest()
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        return AssetManifest(
            entry_js=data.get("entry_js"),
            entry_css=list(data.get("entry_css") or []),
            legacy_entry_aliases=list(data.get("legacy_entry_aliases") or []),
        )
    except Exception as err:
        logger.debug("Failed to load asset manifest: %s", err)
        return AssetManifest()
