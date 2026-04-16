from __future__ import annotations

import json

from kbase.application.dto.common import (
    AssetData,
    AuditEventData,
    ContentPartData,
    InboxFileData,
    ItemFileData,
    ItemRef,
    ItemSummary,
    CategoryData,
    LabelData,
    LinkData,
    MetadataEntryData,
    ProvenanceRecordData,
)
from kbase.infrastructure.db.repositories.helpers import metadata_value_from_row


def to_item_summary(item, *, match_reason: str | None = None) -> ItemSummary:  # type: ignore[no-untyped-def]
    return ItemSummary(
        id=item.id,
        title=item.title,
        item_kind=item.item_kind,
        category_key=item.category_key,
        status=item.status,
        language_code=item.language_code,
        created_by_principal_id=item.created_by_principal_id,
        is_archived=bool(item.is_archived),
        created_at=item.created_at,
        updated_at=item.updated_at,
        match_reason=match_reason,
    )


def to_item_ref(item) -> ItemRef:  # type: ignore[no-untyped-def]
    return ItemRef(
        id=item.id,
        item_kind=item.item_kind,
        category_key=item.category_key,
        title=item.title,
    )


def to_content_part_data(content_part) -> ContentPartData:  # type: ignore[no-untyped-def]
    return ContentPartData(
        id=content_part.id,
        item_id=content_part.item_id,
        part_kind=content_part.part_kind,
        sequence_no=content_part.sequence_no,
        content_text=content_part.content_text,
        content_format=content_part.content_format,
        source_method=content_part.source_method,
        source_data_class=content_part.source_data_class,
        language_code=content_part.language_code,
        created_by_principal_id=content_part.created_by_principal_id,
        created_at=content_part.created_at,
        updated_at=content_part.updated_at,
    )


def to_asset_data(asset) -> AssetData:  # type: ignore[no-untyped-def]
    return AssetData(
        id=asset.id,
        asset_kind=asset.asset_kind,
        storage_path=asset.storage_path,
        original_filename=asset.original_filename,
        mime_type=asset.mime_type,
        size_bytes=asset.size_bytes,
        checksum_sha256=asset.checksum_sha256,
        created_by_principal_id=asset.created_by_principal_id,
        created_at=asset.created_at,
    )


def to_item_file_data(item_file) -> ItemFileData:  # type: ignore[no-untyped-def]
    return ItemFileData(
        id=item_file.id,
        item_id=item_file.item_id,
        file_role=item_file.file_role,
        relative_path=item_file.relative_path,
        original_filename=item_file.original_filename,
        extension=item_file.extension,
        mime_type=item_file.mime_type,
        size_bytes=item_file.size_bytes,
        checksum_sha256=item_file.checksum_sha256,
        created_by_principal_id=item_file.created_by_principal_id,
        created_at=item_file.created_at,
    )


def to_label_data(label) -> LabelData:  # type: ignore[no-untyped-def]
    return LabelData(
        id=label.id,
        name=label.name,
        full_path=label.full_path,
        parent_id=label.parent_id,
        description=label.description,
        depth=label.depth,
        is_active=bool(label.is_active),
        meta=json.loads(label.meta_json) if label.meta_json else {},
    )


def to_category_data(category) -> CategoryData:  # type: ignore[no-untyped-def]
    return CategoryData(
        key=category.key,
        label=category.label,
        description=category.description,
        applies_to_kind=category.applies_to_kind,
        is_active=bool(category.is_active),
    )


def to_link_data(link) -> LinkData:  # type: ignore[no-untyped-def]
    return LinkData(
        id=link.id,
        from_item_id=link.from_item_id,
        to_item_id=link.to_item_id,
        link_type=link.link_type,
        note=link.note,
        created_at=link.created_at,
    )


def to_inbox_file_data(*, relative_path: str, filename: str, size_bytes: int, modified_at: str) -> InboxFileData:
    return InboxFileData(
        relative_path=relative_path,
        filename=filename,
        size_bytes=size_bytes,
        modified_at=modified_at,
    )


def to_metadata_entry(row, field) -> MetadataEntryData:  # type: ignore[no-untyped-def]
    return MetadataEntryData(
        field_key=row.field_key,
        value_type=field.value_type,
        value=metadata_value_from_row(row),
        source=row.source,
        confidence=row.confidence,
    )


def to_audit_event_data(event) -> AuditEventData:  # type: ignore[no-untyped-def]
    return AuditEventData(
        id=event.id,
        item_id=event.item_id,
        actor_principal_id=event.actor_principal_id,
        operation_key=event.operation_key,
        target_table=event.target_table,
        target_id=event.target_id,
        payload_summary=event.payload_summary,
        occurred_at=event.occurred_at,
    )


def to_provenance_record_data(record) -> ProvenanceRecordData:  # type: ignore[no-untyped-def]
    return ProvenanceRecordData(
        id=record.id,
        target_object_type=record.target_object_type,
        target_object_id=record.target_object_id,
        target_field_key=record.target_field_key,
        source_object_type=record.source_object_type,
        source_object_id=record.source_object_id,
        source_uri=record.source_uri,
        method_key=record.method_key,
        data_class=record.data_class,
        confidence=record.confidence,
        created_by_principal_id=record.created_by_principal_id,
        created_at=record.created_at,
    )
