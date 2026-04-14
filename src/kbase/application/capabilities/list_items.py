from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ListItemsInput, ListItemsResult
from kbase.application.services.capability_support import build_repositories
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
        items = repos.items.list(
            item_kind=data.item_kind,
            category_key=data.category_key,
            include_archived=data.include_archived,
            limit=data.limit,
            offset=data.offset,
        )
        return ListItemsResult(
            items=[to_item_summary(item) for item in items],
            limit=data.limit,
            offset=data.offset,
        )

