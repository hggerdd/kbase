from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CreateNoteRequest(BaseModel):
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


class UpdateItemRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = None
    category_key: str | None = None
    status: str | None = None
    language_code: str | None = None
    is_archived: bool | None = None


class ReplaceContentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    part_kind: str = "markdown_body"
    content_text: str
    content_format: str = "markdown"
    change_reason: str | None = None


class AssignLabelsRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label_paths: list[str]


class CreateLabelRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    parent_id: str | None = None
    description: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


class UpdateLabelRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    description: str | None = None


class CreateCategoryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: str
    label: str
    description: str | None = None
    applies_to_kind: str | None = None


class UpdateCategoryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str | None = None
    description: str | None = None
    applies_to_kind: str | None = None
    is_active: bool | None = None


class ClassifyItemRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    primary_category_key: str
    secondary_category_keys: list[str] = Field(default_factory=list)


class PatchMetadataRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    set_fields: dict[str, Any] = Field(default_factory=dict)
    unset_fields: list[str] = Field(default_factory=list)


class RegisterAssetRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    storage_path: str
    asset_kind: str
    original_filename: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None
    checksum_sha256: str | None = None


class AttachAssetRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    asset_id: str
    relationship_role: str
    caption: str | None = None
    sort_order: int | None = None


class CreateFileItemRequest(BaseModel):
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
    link_to_item_id: str | None = None
    link_type: str | None = None
    link_note: str | None = None
    project_ids: list[str] = Field(default_factory=list)
    label_paths: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ImportInboxFileRequest(BaseModel):
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


class LinkItemsRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    from_item_id: str
    to_item_id: str
    link_type: str
    note: str | None = None


class CreateProjectRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    category_key: str = "project_general"
    description: str | None = None
    status: str | None = None


class AddProjectItemRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str
    role: str | None = None
    sort_order: int | None = None


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str
    password: str


class CreateApiTokenRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token_label: str


class ReplaceItemAclRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    grants: list[dict[str, str]] = Field(default_factory=list)
