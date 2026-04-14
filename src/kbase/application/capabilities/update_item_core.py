from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import UpdateItemCoreInput
from kbase.application.dto.common import ItemSummary
from kbase.application.services.capability_support import build_repositories, record_write, require_item
from kbase.application.services.mappers import to_item_summary
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
        return to_item_summary(updated)

