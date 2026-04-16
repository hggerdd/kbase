from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ListItemsInput, ListItemsResult
from kbase.application.services.capability_support import build_repositories, principal_scope
from kbase.application.services.security import READ_PERMISSIONS
from kbase.application.services.mappers import to_item_summary
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def list_items(
    data: ListItemsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ListItemsResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        accessible_principal_ids = principal_scope(repos, data.actor.principal_id)
        items = repos.items.list(
            item_kind=data.item_kind,
            category_key=data.category_key,
            include_archived=data.include_archived,
            limit=data.limit,
            offset=data.offset,
            accessible_principal_ids=accessible_principal_ids,
            permission_keys=READ_PERMISSIONS,
        )
        return ListItemsResult(
            items=[to_item_summary(item) for item in items],
            limit=data.limit,
            offset=data.offset,
        )
