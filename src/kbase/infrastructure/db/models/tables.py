from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from kbase.infrastructure.db.models.base import Base


class ItemCategoryModel(Base):
    __tablename__ = "item_categories"

    key: Mapped[str] = mapped_column(Text, primary_key=True)
    label: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    applies_to_kind: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[int] = mapped_column(Integer, default=1)


class MetadataFieldModel(Base):
    __tablename__ = "metadata_fields"

    key: Mapped[str] = mapped_column(Text, primary_key=True)
    label: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    value_type: Mapped[str] = mapped_column(Text)
    applies_to_kind: Mapped[str | None] = mapped_column(Text)
    is_multivalue: Mapped[int] = mapped_column(Integer, default=0)
    is_system: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[int] = mapped_column(Integer, default=1)


class PrincipalModel(Base):
    __tablename__ = "principals"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    principal_type: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    slug: Mapped[str] = mapped_column(Text, unique=True)
    is_active: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[str] = mapped_column(Text)


class ItemModel(Base):
    __tablename__ = "items"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    title: Mapped[str] = mapped_column(Text)
    item_kind: Mapped[str] = mapped_column(Text)
    category_key: Mapped[str | None] = mapped_column(ForeignKey("item_categories.key"))
    status: Mapped[str | None] = mapped_column(Text)
    origin: Mapped[str] = mapped_column(Text)
    language_code: Mapped[str | None] = mapped_column(Text)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    parent_item_id: Mapped[str | None] = mapped_column(ForeignKey("items.id"))
    is_archived: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[str] = mapped_column(Text)
    archived_at: Mapped[str | None] = mapped_column(Text)


class ItemClassificationModel(Base):
    __tablename__ = "item_classifications"

    item_id: Mapped[str] = mapped_column(ForeignKey("items.id"), primary_key=True)
    category_key: Mapped[str] = mapped_column(ForeignKey("item_categories.key"), primary_key=True)
    classification_role: Mapped[str] = mapped_column(Text, primary_key=True, default="secondary")
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class ContentPartModel(Base):
    __tablename__ = "content_parts"
    __table_args__ = (UniqueConstraint("item_id", "sequence_no"),)

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("items.id"))
    part_kind: Mapped[str] = mapped_column(Text)
    sequence_no: Mapped[int] = mapped_column(Integer, default=0)
    page_no: Mapped[int | None] = mapped_column(Integer)
    heading_path: Mapped[str | None] = mapped_column(Text)
    content_text: Mapped[str] = mapped_column(Text)
    content_format: Mapped[str] = mapped_column(Text, default="markdown")
    source_method: Mapped[str] = mapped_column(Text, default="manual")
    source_data_class: Mapped[str] = mapped_column(Text, default="canonical")
    language_code: Mapped[str | None] = mapped_column(Text)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[str] = mapped_column(Text)


class ContentPartVersionModel(Base):
    __tablename__ = "content_part_versions"
    __table_args__ = (UniqueConstraint("content_part_id", "version_no"),)

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    content_part_id: Mapped[str] = mapped_column(ForeignKey("content_parts.id"))
    version_no: Mapped[int] = mapped_column(Integer)
    content_text: Mapped[str] = mapped_column(Text)
    content_format: Mapped[str] = mapped_column(Text)
    change_reason: Mapped[str | None] = mapped_column(Text)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class ItemFileModel(Base):
    __tablename__ = "item_files"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("items.id"))
    file_role: Mapped[str] = mapped_column(Text)
    relative_path: Mapped[str] = mapped_column(Text, unique=True)
    original_filename: Mapped[str | None] = mapped_column(Text)
    extension: Mapped[str | None] = mapped_column(Text)
    mime_type: Mapped[str | None] = mapped_column(Text)
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    checksum_sha256: Mapped[str | None] = mapped_column(Text)
    source_data_class: Mapped[str] = mapped_column(Text, default="canonical")
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class AssetModel(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    asset_kind: Mapped[str] = mapped_column(Text)
    storage_path: Mapped[str] = mapped_column(Text, unique=True)
    original_filename: Mapped[str | None] = mapped_column(Text)
    extension: Mapped[str | None] = mapped_column(Text)
    mime_type: Mapped[str | None] = mapped_column(Text)
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    checksum_sha256: Mapped[str | None] = mapped_column(Text)
    source_data_class: Mapped[str] = mapped_column(Text, default="canonical")
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class ItemAssetModel(Base):
    __tablename__ = "item_assets"
    __table_args__ = (UniqueConstraint("item_id", "asset_id", "relationship_role"),)

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("items.id"))
    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id"))
    relationship_role: Mapped[str] = mapped_column(Text)
    caption: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class LabelNodeModel(Base):
    __tablename__ = "label_nodes"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    full_path: Mapped[str] = mapped_column(Text, unique=True)
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("label_nodes.id"))
    description: Mapped[str | None] = mapped_column(Text)
    depth: Mapped[int] = mapped_column(Integer, default=0)
    meta_json: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[str] = mapped_column(Text)


class ItemLabelModel(Base):
    __tablename__ = "item_labels"

    item_id: Mapped[str] = mapped_column(ForeignKey("items.id"), primary_key=True)
    label_id: Mapped[str] = mapped_column(ForeignKey("label_nodes.id"), primary_key=True)
    source: Mapped[str] = mapped_column(Text, default="manual")
    confidence: Mapped[float | None] = mapped_column(Float)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class ItemLinkModel(Base):
    __tablename__ = "item_links"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    from_item_id: Mapped[str] = mapped_column(ForeignKey("items.id"))
    to_item_id: Mapped[str] = mapped_column(ForeignKey("items.id"))
    link_type: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(Text, default="manual")
    confidence: Mapped[float | None] = mapped_column(Float)
    note: Mapped[str | None] = mapped_column(Text)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class ItemMetadataModel(Base):
    __tablename__ = "item_metadata"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("items.id"))
    field_key: Mapped[str] = mapped_column(ForeignKey("metadata_fields.key"))
    value_text: Mapped[str | None] = mapped_column(Text)
    value_number: Mapped[float | None] = mapped_column(Float)
    value_integer: Mapped[int | None] = mapped_column(Integer)
    value_date: Mapped[str | None] = mapped_column(Text)
    value_datetime: Mapped[str | None] = mapped_column(Text)
    value_bool: Mapped[int | None] = mapped_column(Integer)
    value_json: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(Text, default="manual")
    confidence: Mapped[float | None] = mapped_column(Float)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[str] = mapped_column(Text)


class ProjectItemModel(Base):
    __tablename__ = "project_items"

    project_id: Mapped[str] = mapped_column(ForeignKey("items.id"), primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("items.id"), primary_key=True)
    role: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    added_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)


class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    item_id: Mapped[str | None] = mapped_column(ForeignKey("items.id"))
    actor_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    operation_key: Mapped[str] = mapped_column(Text)
    target_table: Mapped[str] = mapped_column(Text)
    target_id: Mapped[str] = mapped_column(Text)
    payload_summary: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[str] = mapped_column(Text)


class ProvenanceRecordModel(Base):
    __tablename__ = "provenance_records"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    target_object_type: Mapped[str] = mapped_column(Text)
    target_object_id: Mapped[str] = mapped_column(Text)
    target_field_key: Mapped[str | None] = mapped_column(Text)
    source_object_type: Mapped[str | None] = mapped_column(Text)
    source_object_id: Mapped[str | None] = mapped_column(Text)
    source_uri: Mapped[str | None] = mapped_column(Text)
    method_key: Mapped[str] = mapped_column(Text)
    data_class: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Float)
    created_by_principal_id: Mapped[str | None] = mapped_column(ForeignKey("principals.id"))
    created_at: Mapped[str] = mapped_column(Text)
