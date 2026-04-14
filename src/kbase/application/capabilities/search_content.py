from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import SearchContentInput, SearchContentResult
from kbase.application.services.capability_support import build_repositories
from kbase.application.services.mappers import to_item_summary
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def search_content(
    data: SearchContentInput,
    *,
    session_factory: sessionmaker | None = None,
) -> SearchContentResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        items = repos.search.search_items(
            query=data.query,
            item_kinds=data.item_kinds,
            category_keys=data.category_keys,
            label_paths=data.label_paths,
            statuses=data.statuses,
            created_by_principal_ids=data.created_by_principal_ids,
            project_id=data.project_id,
            include_archived=data.include_archived,
            limit=data.limit,
            offset=data.offset,
        )
        return SearchContentResult(
            items=[to_item_summary(item, match_reason=reason) for item, reason in items],
            limit=data.limit,
            offset=data.offset,
        )

