from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import UpdateItemCoreInput
from kbase.application.dto.common import ItemSummary
from kbase.application.services.capability_support import (
    build_repositories,
    record_write,
    require_item,
    require_item_write,
)
from kbase.application.services.linked_file_context import propagate_context_to_exclusive_attachments
from kbase.application.services.mappers import to_item_summary
from kbase.core.policies.classification_policy import category_applies_to_item_kind
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def update_item_core(
    data: UpdateItemCoreInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemSummary:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        item = require_item(repos.items, data.item_id)
        require_item_write(repos, item_id=item.id, actor_principal_id=data.actor.principal_id)
        if data.category_key is not None:
            category = repos.items.get_category(data.category_key)
            if category is None:
                raise ValueError(f"Unknown category '{data.category_key}'")
            if not category_applies_to_item_kind(category.applies_to_kind, item.item_kind):
                raise ValueError(f"Category '{data.category_key}' is not valid for {item.item_kind}")
        updated = repos.items.update_core(
            item,
            title=data.title,
            category_key=data.category_key,
            status=data.status,
            language_code=data.language_code,
            is_archived=data.is_archived,
        )
        record_write(
            repos=repos,
            item_id=updated.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="update_item_core",
            target_table="items",
            target_id=updated.id,
            payload_summary=updated.title,
            target_object_type="item",
            target_object_id=updated.id,
            target_field_key=None,
            provenance=data.provenance,
        )
        if data.category_key is not None:
            propagate_context_to_exclusive_attachments(
                repos,
                source_item_id=updated.id,
                actor=data.actor,
                provenance=data.provenance,
                category_key_provided=True,
            )
        return to_item_summary(updated)
