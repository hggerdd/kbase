from __future__ import annotations

import os
import re
from pathlib import Path


FILE_KIND_CONFIG = {
    "document": ("documents", "doc"),
    "image": ("images", "img"),
    "spreadsheet": ("spreadsheets", "sheet"),
    "summary": ("summaries", "summary"),
}


def _workspace_root() -> Path:
    return Path(__file__).resolve().parents[4]


def _storage_root() -> Path:
    env_root = os.getenv("KBASE_STORAGE_ROOT")
    if env_root:
        return Path(env_root)
    return _workspace_root() / "kb" / "items"


def _slugify(value: str) -> str:
    lowered = value.strip().lower()
    lowered = re.sub(r"[^a-z0-9]+", "_", lowered)
    lowered = re.sub(r"_+", "_", lowered).strip("_")
    return lowered or "item"


class ItemFileStore:
    def __init__(self, root: Path | None = None) -> None:
        self.root = root or _storage_root()

    def build_relative_path(
        self,
        *,
        item_kind: str,
        item_id: str,
        original_filename: str,
        title: str,
    ) -> str:
        if item_kind not in FILE_KIND_CONFIG:
            raise ValueError(f"Unsupported file item kind '{item_kind}'")
        folder_name, prefix = FILE_KIND_CONFIG[item_kind]
        extension = Path(original_filename).suffix.lower()
        bucket = item_id[10:12].lower() if len(item_id) >= 12 else item_id[:2].lower()
        slug = _slugify(Path(title).stem)
        filename = f"{prefix}_{item_id}_{slug}{extension}"
        return f"{folder_name}/{bucket}/{filename}"

    def write_bytes(self, *, relative_path: str, payload: bytes) -> Path:
        target = self.root / Path(relative_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
        return target
