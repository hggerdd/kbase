from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class AssetEntity:
    id: str
    asset_kind: str
    storage_path: str
    original_filename: str | None
    extension: str | None
    mime_type: str | None
    size_bytes: int | None
    checksum_sha256: str | None
    source_data_class: str
    created_by_principal_id: str | None
    created_at: str

