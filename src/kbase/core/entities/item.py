from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ItemEntity:
    id: str
    title: str
    item_kind: str
    category_key: str | None
    status: str | None
    origin: str
    language_code: str | None
    created_by_principal_id: str | None
    parent_item_id: str | None
    is_archived: bool
    created_at: str
    updated_at: str
    archived_at: str | None

