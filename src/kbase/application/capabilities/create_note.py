from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import CreateNoteInput, CreateNoteResult
from kbase.application.services.capability_support import (
    build_repositories,
    ensure_owner_acl,
    record_write,
    require_item_write,
)
from kbase.application.services.mappers import to_content_part_data, to_item_summary
from kbase.core.policies.metadata_policy import (
    build_typed_metadata_payload,
    ensure_metadata_field_matches_item_kind,
    ensure_metadata_key_allowed,
)
from kbase.core.policies.classification_policy import category_applies_to_item_kind
from kbase.core.rules.modelling_rules import NOTE_ITEM_KIND, PRIMARY_CONTENT_PART_KIND
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def create_note(
    data: CreateNoteInput,
    *,
    session_factory: sessionmaker | None = None,
) -> CreateNoteResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        category = repos.items.get_category(data.category_key)
        if category is None:
            raise ValueError(f"Unknown category '{data.category_key}'")
        if not category_applies_to_item_kind(category.applies_to_kind, NOTE_ITEM_KIND):
            raise ValueError(f"Category '{data.category_key}' is not valid for notes")

        item = repos.items.create(
            title=data.title,
            item_kind=NOTE_ITEM_KIND,
            category_key=data.category_key,
            status=data.status,
            origin="manual",
            language_code=data.language_code,
            created_by_principal_id=data.actor.principal_id,
            parent_item_id=data.parent_item_id,
        )
        ensure_owner_acl(repos, item_id=item.id, actor_principal_id=data.actor.principal_id)
        content_part = repos.content.create_content_part(
            item_id=item.id,
            part_kind=PRIMARY_CONTENT_PART_KIND,
            content_text=data.markdown_body,
            content_format="markdown",
            source_method="manual",
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
            ensure_metadata_field_matches_item_kind(field_key, field.applies_to_kind, NOTE_ITEM_KIND)
            typed_values = build_typed_metadata_payload(field.value_type, value)
            repos.metadata.upsert_field(
                item_id=item.id,
                field_key=field_key,
                values=typed_values,
                source="manual",
                confidence=None,
                created_by_principal_id=data.actor.principal_id,
            )

        audit_event = record_write(
            repos=repos,
            item_id=item.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="create_note",
            target_table="items",
            target_id=item.id,
            payload_summary=data.title,
            target_object_type="item",
            target_object_id=item.id,
            target_field_key=None,
            provenance=data.provenance,
        )

        return CreateNoteResult(
            item=to_item_summary(item),
            primary_content_part=to_content_part_data(content_part),
            audit_event_id=audit_event.id,
        )
