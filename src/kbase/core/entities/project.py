from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ProjectEntity:
    id: str
    title: str
    category_key: str | None
    status: str | None
    created_by_principal_id: str | None
    created_at: str
    updated_at: str

