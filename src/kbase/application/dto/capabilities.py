from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from kbase.application.dto.common import (
    AclEntryData,
    AclGrantData,
    ApiTokenData,
    AssetData,
    AuditEventData,
    CategoryData,
    ContentPartData,
    InboxFileData,
    ItemFileData,
    ItemRef,
    ItemSummary,
    LabelData,
    LinkData,
    MetadataEntryData,
    PaginationInput,
    ProvenanceRecordData,
    SessionData,
)
from kbase.core.value_objects.actor import ActorContext
from kbase.core.value_objects.provenance import ProvenanceInput


class CreateNoteInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    category_key: str
    status: str | None = None
    language_code: str | None = None
    markdown_body: str
    parent_item_id: str | None = None
    project_ids: list[str] = Field(default_factory=list)
    label_paths: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    actor: ActorContext
    provenance: ProvenanceInput


class CreateNoteResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item: ItemSummary
    primary_content_part: ContentPartData
    audit_event_id: str


class UpdateItemCoreInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    title: str | None = None
    category_key: str | None = None
    status: str | None = None
    language_code: str | None = None
    is_archived: bool | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class ReplaceContentPartInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    part_kind: str = "markdown_body"
    content_text: str
    content_format: str = "markdown"
    change_reason: str | None = None
    expected_content_updated_at: str | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class SearchContentInput(PaginationInput):
    model_config = ConfigDict(extra="forbid")

    query: str | None = None
    item_kinds: list[str] = Field(default_factory=list)
    category_keys: list[str] = Field(default_factory=list)
    label_paths: list[str] = Field(default_factory=list)
    label_path_prefixes: list[str] = Field(default_factory=list)
    statuses: list[str] = Field(default_factory=list)
    created_by_principal_ids: list[str] = Field(default_factory=list)
    project_id: str | None = None
    include_archived: bool = False
    actor: ActorContext


class PatchItemMetadataInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    set_fields: dict[str, Any] = Field(default_factory=dict)
    unset_fields: list[str] = Field(default_factory=list)
    actor: ActorContext
    provenance: ProvenanceInput


class RegisterAssetInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    storage_path: str
    asset_kind: str
    original_filename: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None
    checksum_sha256: str | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class AttachAssetToItemInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    asset_id: str
    relationship_role: str
    caption: str | None = None
    sort_order: int | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class CreateFileItemInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = None
    item_kind: str
    category_key: str | None = None
    status: str | None = None
    language_code: str | None = None
    original_filename: str
    mime_type: str | None = None
    size_bytes: int | None = None
    checksum_sha256: str | None = None
    file_bytes: bytes
    link_to_item_id: str | None = None
    link_type: str | None = None
    link_note: str | None = None
    project_ids: list[str] = Field(default_factory=list)
    label_paths: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    actor: ActorContext
    provenance: ProvenanceInput


class ImportInboxFileInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    inbox_relative_path: str
    title: str | None = None
    item_kind: str | None = None
    category_key: str | None = None
    status: str | None = None
    language_code: str | None = None
    link_to_item_id: str | None = None
    link_type: str | None = None
    link_note: str | None = None
    project_ids: list[str] = Field(default_factory=list)
    label_paths: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    actor: ActorContext
    provenance: ProvenanceInput


class LinkItemsInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    from_item_id: str
    to_item_id: str
    link_type: str
    note: str | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class ClassifyItemInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    primary_category_key: str
    secondary_category_keys: list[str] = Field(default_factory=list)
    actor: ActorContext
    provenance: ProvenanceInput


class AssignLabelsInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    label_paths: list[str]
    actor: ActorContext
    provenance: ProvenanceInput


class ListLabelsInput(PaginationInput):
    model_config = ConfigDict(extra="forbid")

    query: str | None = None
    include_inactive: bool = False
    parent_id: str | None = None
    full_path_prefix: str | None = None
    actor: ActorContext


class ListCategoriesInput(PaginationInput):
    model_config = ConfigDict(extra="forbid")

    query: str | None = None
    applies_to_kind: str | None = None
    include_inactive: bool = False
    actor: ActorContext


class ListCategoriesResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    categories: list[CategoryData]
    limit: int
    offset: int


class CreateCategoryInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: str
    label: str
    description: str | None = None
    applies_to_kind: str | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class UpdateCategoryInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: str
    label: str | None = None
    description: str | None = None
    description_provided: bool = False
    applies_to_kind: str | None = None
    applies_to_kind_provided: bool = False
    is_active: bool | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class DeleteCategoryInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: str
    actor: ActorContext
    provenance: ProvenanceInput


class DeleteCategoryResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: str
    deleted: bool


class CreateLabelInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    parent_id: str | None = None
    description: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)
    actor: ActorContext
    provenance: ProvenanceInput


class RenameLabelInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label_id: str
    name: str
    actor: ActorContext
    provenance: ProvenanceInput


class UpdateLabelInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label_id: str
    name: str | None = None
    description: str | None = None
    description_provided: bool = False
    actor: ActorContext
    provenance: ProvenanceInput


class DeactivateLabelInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label_id: str
    actor: ActorContext
    provenance: ProvenanceInput


class DeleteLabelInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label_id: str
    actor: ActorContext
    provenance: ProvenanceInput


class DeleteLabelResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deleted_label_ids: list[str]
    deleted_count: int
    deleted_paths: list[str]


class ReactivateLabelInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label_id: str
    actor: ActorContext
    provenance: ProvenanceInput


class CreateProjectInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    category_key: str = "project_general"
    description: str | None = None
    status: str | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class LoginInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str
    password: str
    request_id: str | None = None


class LoginResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session: SessionData
    session_token: str


class GetSessionInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_token: str | None = None
    api_token: str | None = None
    request_id: str | None = None


class LogoutInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_token: str


class CreateApiTokenInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token_label: str
    actor: ActorContext


class CreateApiTokenWithPasswordInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str
    password: str
    token_label: str


class CreateApiTokenResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: ApiTokenData
    secret: str


class AddItemToProjectInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_id: str
    item_id: str
    role: str | None = None
    sort_order: int | None = None
    actor: ActorContext
    provenance: ProvenanceInput


class ReplaceItemProjectsInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    project_ids: list[str] = Field(default_factory=list)
    actor: ActorContext
    provenance: ProvenanceInput


class GetItemInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    actor: ActorContext


class ListItemsInput(PaginationInput):
    model_config = ConfigDict(extra="forbid")

    item_kind: str | None = None
    category_key: str | None = None
    include_archived: bool = False
    actor: ActorContext


class ListRelatedItemsInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    actor: ActorContext


class ListProjectItemsInput(PaginationInput):
    model_config = ConfigDict(extra="forbid")

    project_id: str
    actor: ActorContext


class ItemDetailResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item: ItemSummary
    primary_content_part: ContentPartData | None = None
    content_parts: list[ContentPartData] = Field(default_factory=list)
    labels: list[LabelData] = Field(default_factory=list)
    classifications: list[str] = Field(default_factory=list)
    metadata: list[MetadataEntryData] = Field(default_factory=list)
    files: list[ItemFileData] = Field(default_factory=list)
    outgoing_links: list[LinkData] = Field(default_factory=list)
    linked_assets: list[AssetData] = Field(default_factory=list)
    related_items: list[ItemRef] = Field(default_factory=list)
    projects: list[ItemRef] = Field(default_factory=list)


class ListItemsResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[ItemSummary]
    limit: int
    offset: int


class SearchContentResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[ItemSummary]
    limit: int
    offset: int


class ListInboxFilesResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    files: list[InboxFileData]


class ListRelatedItemsResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    related_items: list[ItemRef]


class ListProjectItemsResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project: ItemRef
    items: list[ItemSummary]
    limit: int
    offset: int


class GetItemAclInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    actor: ActorContext


class ReplaceItemAclInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    grants: list[AclGrantData]
    actor: ActorContext
    provenance: ProvenanceInput


class GetItemHistoryResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    events: list[AuditEventData]


class GetItemProvenanceResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    records: list[ProvenanceRecordData]
