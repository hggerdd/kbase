from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ListRelatedItemsInput, ListRelatedItemsResult
from kbase.application.services.capability_support import (
    build_repositories,
    filter_accessible_items,
    require_item,
    require_item_read,
)
from kbase.application.services.mappers import to_item_ref
from kbase.application.services.security import READ_PERMISSIONS
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def list_related_items(
    data: ListRelatedItemsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ListRelatedItemsResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.item_id)
        require_item_read(repos, item_id=data.item_id, actor_principal_id=data.actor.principal_id)
        related = filter_accessible_items(
            repos,
            items=repos.links.list_related_items(data.item_id),
            actor_principal_id=data.actor.principal_id,
            permission_keys=READ_PERMISSIONS,
        )
        return ListRelatedItemsResult(
            item_id=data.item_id,
            related_items=[to_item_ref(item) for item in related],
        )
