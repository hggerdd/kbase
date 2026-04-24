from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import PatchItemMetadataInput
from kbase.application.dto.common import MetadataEntryData
from kbase.application.services.capability_support import (
    build_repositories,
    record_write,
    require_item,
    require_item_write,
)
from kbase.core.policies.metadata_policy import (
    build_typed_metadata_payload,
    ensure_metadata_field_matches_item_kind,
    ensure_metadata_key_allowed,
)
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def patch_item_metadata(
    data: PatchItemMetadataInput,
    *,
    session_factory: sessionmaker | None = None,
) -> list[MetadataEntryData]:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        item = require_item(repos.items, data.item_id)
        require_item_write(repos, item_id=item.id, actor_principal_id=data.actor.principal_id)
        for field_key, value in data.set_fields.items():
            ensure_metadata_key_allowed(field_key)
            field = repos.metadata.get_field_definition(field_key)
            if field is None:
                raise ValueError(f"Unknown metadata field '{field_key}'")
            ensure_metadata_field_matches_item_kind(field_key, field.applies_to_kind, item.item_kind)
            typed_values = build_typed_metadata_payload(field.value_type, value)
            repos.metadata.upsert_field(
                item_id=item.id,
                field_key=field_key,
                values=typed_values,
                source="manual",
                confidence=None,
                created_by_principal_id=data.actor.principal_id,
            )
        repos.metadata.unset_fields(item.id, data.unset_fields)
        record_write(
            repos=repos,
            item_id=item.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="patch_item_metadata",
            target_table="item_metadata",
            target_id=item.id,
            payload_summary=", ".join(sorted(set(data.set_fields.keys()) | set(data.unset_fields))),
            target_object_type="item",
            target_object_id=item.id,
            target_field_key="metadata",
            provenance=data.provenance,
        )
        rows = repos.metadata.list_metadata(item.id)
        return [
            MetadataEntryData(
                field_key=field_key,
                value_type=value_type,
                value=value,
                source=source,
                confidence=confidence,
            )
            for field_key, value_type, value, source, confidence in rows
        ]
