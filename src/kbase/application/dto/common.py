from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput


class PaginationInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    limit: int = Field(default=50, ge=1, le=500)
    offset: int = Field(default=0, ge=0)


class ItemRef(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    item_kind: str
    category_key: str | None = None
    title: str


class ContentPartData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    item_id: str
    part_kind: str
    sequence_no: int
    content_text: str
    content_format: str
    source_method: str
    source_data_class: str
    language_code: str | None = None
    created_by_principal_id: str | None = None
    created_at: str
    updated_at: str


class AssetData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    asset_kind: str
    storage_path: str
    original_filename: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None
    checksum_sha256: str | None = None
    created_by_principal_id: str | None = None
    created_at: str


class ItemFileData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    item_id: str
    file_role: str
    relative_path: str
    original_filename: str | None = None
    extension: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None
    checksum_sha256: str | None = None
    created_by_principal_id: str | None = None
    created_at: str


class ItemSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    item_kind: str
    category_key: str | None = None
    status: str | None = None
    language_code: str | None = None
    created_by_principal_id: str | None = None
    is_archived: bool
    created_at: str
    updated_at: str
    match_reason: str | None = None


class LinkData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    from_item_id: str
    to_item_id: str
    link_type: str
    note: str | None = None
    created_at: str


class InboxFileData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    relative_path: str
    filename: str
    size_bytes: int
    modified_at: str


class LabelData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    full_path: str
    parent_id: str | None = None
    description: str | None = None
    depth: int = 0
    is_active: bool = True
    meta: dict[str, Any] = Field(default_factory=dict)


class MetadataEntryData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field_key: str
    value_type: str
    value: Any
    source: str
    confidence: float | None = None


class AuditEventData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    item_id: str | None = None
    actor_principal_id: str | None = None
    operation_key: str
    target_table: str
    target_id: str
    payload_summary: str | None = None
    occurred_at: str


class ProvenanceRecordData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    target_object_type: str
    target_object_id: str
    target_field_key: str | None = None
    source_object_type: str | None = None
    source_object_id: str | None = None
    source_uri: str | None = None
    method_key: str
    data_class: str
    confidence: float | None = None
    created_by_principal_id: str | None = None
    created_at: str


class CapabilityContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    actor: ActorContext
    provenance: ProvenanceInput
