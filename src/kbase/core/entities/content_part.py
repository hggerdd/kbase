from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ContentPartEntity:
    id: str
    item_id: str
    part_kind: str
    sequence_no: int
    content_text: str
    content_format: str
    source_method: str
    source_data_class: str
    language_code: str | None
    created_by_principal_id: str | None
    created_at: str
    updated_at: str

