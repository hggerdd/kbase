from __future__ import annotations

import hashlib
from pathlib import Path

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import CreateFileItemInput, ItemDetailResult
from kbase.application.services.capability_support import (
    build_repositories,
    ensure_owner_acl,
    record_write,
    require_item,
    require_item_write,
)
from kbase.application.services.mappers import (
    to_item_file_data,
    to_item_ref,
    to_item_summary,
    to_label_data,
    to_metadata_entry,
)
from kbase.core.policies.metadata_policy import (
    build_typed_metadata_payload,
    ensure_metadata_field_matches_item_kind,
    ensure_metadata_key_allowed,
)
from kbase.core.rules.modelling_rules import FILE_ITEM_KINDS, ITEM_FILE_ROLE_PRIMARY
from kbase.infrastructure.db.models.tables import ItemMetadataModel, MetadataFieldModel
from kbase.infrastructure.db.repositories.helpers import metadata_value_from_row
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork
from kbase.infrastructure.files.item_file_store import ItemFileStore
from sqlalchemy import select


def import_file_as_item(
    data: CreateFileItemInput,
    *,
    store: ItemFileStore | None = None,
    session_factory: sessionmaker | None = None,
) -> ItemDetailResult:
    if data.item_kind not in FILE_ITEM_KINDS:
        raise ValueError(f"Unsupported file item kind '{data.item_kind}'")

    file_store = store or ItemFileStore()
    checksum_sha256 = data.checksum_sha256 or hashlib.sha256(data.file_bytes).hexdigest()
    title = data.title or Path(data.original_filename).name

    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)

        if data.category_key is not None:
            category = repos.items.get_category(data.category_key)
            if category is None:
                raise ValueError(f"Unknown category '{data.category_key}'")
            if category.applies_to_kind != data.item_kind:
                raise ValueError(f"Category '{data.category_key}' is not valid for {data.item_kind}")

        if data.link_to_item_id is not None:
            require_item(repos.items, data.link_to_item_id)
            require_item_write(
                repos,
                item_id=data.link_to_item_id,
                actor_principal_id=data.actor.principal_id,
            )

        item = repos.items.create(
            title=title,
            item_kind=data.item_kind,
            category_key=data.category_key,
            status=data.status,
            origin="import",
            language_code=data.language_code,
            created_by_principal_id=data.actor.principal_id,
        )
        ensure_owner_acl(repos, item_id=item.id, actor_principal_id=data.actor.principal_id)

        relative_path = file_store.build_relative_path(
            item_kind=data.item_kind,
            item_id=item.id,
            original_filename=data.original_filename,
            title=title,
        )
        file_store.write_bytes(relative_path=relative_path, payload=data.file_bytes)

        item_file = repos.item_files.create_file(
            item_id=item.id,
            file_role=ITEM_FILE_ROLE_PRIMARY,
            relative_path=relative_path,
            original_filename=data.original_filename,
            mime_type=data.mime_type,
            size_bytes=data.size_bytes or len(data.file_bytes),
            checksum_sha256=checksum_sha256,
            source_data_class=data.provenance.data_class,
            created_by_principal_id=data.actor.principal_id,
        )

        if data.label_paths:
            repos.labels.assign_labels(
                item_id=item.id,
                label_paths=data.label_paths,
                created_by_principal_id=data.actor.principal_id,
            )

        for project_id in data.project_ids:
            require_item_write(repos, item_id=project_id, actor_principal_id=data.actor.principal_id)
            repos.projects.add_item_to_project(
                project_id=project_id,
                item_id=item.id,
                role=None,
                sort_order=0,
                added_by_principal_id=data.actor.principal_id,
            )

        for field_key, value in data.metadata.items():
            ensure_metadata_key_allowed(field_key)
            field = repos.metadata.get_field_definition(field_key)
            if field is None:
                raise ValueError(f"Unknown metadata field '{field_key}'")
            ensure_metadata_field_matches_item_kind(field_key, field.applies_to_kind, data.item_kind)
            typed_values = build_typed_metadata_payload(field.value_type, value)
            repos.metadata.upsert_field(
                item_id=item.id,
                field_key=field_key,
                values=typed_values,
                source="manual",
                confidence=None,
                created_by_principal_id=data.actor.principal_id,
            )

        if data.link_to_item_id is not None:
            repos.links.create_link(
                from_item_id=data.link_to_item_id,
                to_item_id=item.id,
                link_type=data.link_type or "attachment",
                note=data.link_note,
                created_by_principal_id=data.actor.principal_id,
            )
            record_write(
                repos=repos,
                item_id=data.link_to_item_id,
                actor_principal_id=data.actor.principal_id,
                operation_key="link_items",
                target_table="item_links",
                target_id=data.link_to_item_id,
                payload_summary=data.link_type or "attachment",
                target_object_type="item",
                target_object_id=data.link_to_item_id,
                target_field_key="links",
                provenance=data.provenance,
            )

        record_write(
            repos=repos,
            item_id=item.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="import_file_item",
            target_table="items",
            target_id=item.id,
            payload_summary=title,
            target_object_type="item",
            target_object_id=item.id,
            target_field_key=None,
            provenance=data.provenance,
        )

        stmt = (
            select(ItemMetadataModel, MetadataFieldModel)
            .join(MetadataFieldModel, MetadataFieldModel.key == ItemMetadataModel.field_key)
            .where(ItemMetadataModel.item_id == item.id)
            .order_by(ItemMetadataModel.field_key.asc())
        )
        metadata_entries = [to_metadata_entry(row, field) for row, field in uow.session.execute(stmt)]

        return ItemDetailResult(
            item=to_item_summary(item),
            primary_content_part=None,
            content_parts=[],
            labels=[to_label_data(label) for label in repos.labels.list_labels_for_item(item.id)],
            classifications=repos.items.get_classifications(item.id),
            metadata=metadata_entries,
            files=[to_item_file_data(item_file)],
            linked_assets=[],
            related_items=[to_item_ref(related) for related in repos.links.list_related_items(item.id)],
            projects=[to_item_ref(project) for project in repos.projects.list_projects_for_item(item.id)],
        )
