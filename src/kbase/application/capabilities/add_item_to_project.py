from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import AddItemToProjectInput
from kbase.application.dto.common import ItemRef
from kbase.application.services.capability_support import (
    build_repositories,
    record_write,
    require_item,
    require_item_read,
    require_item_write,
)
from kbase.application.services.mappers import to_item_ref
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def add_item_to_project(
    data: AddItemToProjectInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemRef:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.project_id)
        require_item_write(repos, item_id=data.project_id, actor_principal_id=data.actor.principal_id)
        item = require_item(repos.items, data.item_id)
        require_item_read(repos, item_id=item.id, actor_principal_id=data.actor.principal_id)
        repos.projects.add_item_to_project(
            project_id=data.project_id,
            item_id=data.item_id,
            role=data.role,
            sort_order=data.sort_order or 0,
            added_by_principal_id=data.actor.principal_id,
        )
        record_write(
            repos=repos,
            item_id=data.project_id,
            actor_principal_id=data.actor.principal_id,
            operation_key="add_item_to_project",
            target_table="project_items",
            target_id=data.project_id,
            payload_summary=data.item_id,
            target_object_type="item",
            target_object_id=data.project_id,
            target_field_key="project_items",
            provenance=data.provenance,
        )
        return to_item_ref(item)
