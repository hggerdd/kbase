from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ListCategoriesInput, ListCategoriesResult
from kbase.application.services.capability_support import build_repositories
from kbase.application.services.mappers import to_category_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def list_categories(
    data: ListCategoriesInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ListCategoriesResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        categories = repos.items.list_categories(
            query=data.query,
            applies_to_kind=data.applies_to_kind,
            parent_key=data.parent_key,
            full_path_prefix=data.full_path_prefix,
            include_inactive=data.include_inactive,
        )
        sliced = categories[data.offset : data.offset + data.limit]
        return ListCategoriesResult(
            categories=[to_category_data(category) for category in sliced],
            limit=data.limit,
            offset=data.offset,
        )
