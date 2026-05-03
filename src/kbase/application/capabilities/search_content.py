from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import SearchContentInput, SearchContentResult
from kbase.application.services.capability_support import build_repositories, principal_scope
from kbase.application.services.security import READ_PERMISSIONS
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
        accessible_principal_ids = principal_scope(repos, data.actor.principal_id)
        items = repos.search.search_items(
            query=data.query,
            item_kinds=data.item_kinds,
            category_keys=data.category_keys,
            category_path_prefixes=data.category_path_prefixes,
            label_paths=data.label_paths,
            label_path_prefixes=data.label_path_prefixes,
            statuses=data.statuses,
            created_by_principal_ids=data.created_by_principal_ids,
            project_id=data.project_id,
            include_archived=data.include_archived,
            limit=data.limit,
            offset=data.offset,
            accessible_principal_ids=accessible_principal_ids,
            permission_keys=READ_PERMISSIONS,
        )
        return SearchContentResult(
            items=[to_item_summary(item, match_reason=reason) for item, reason in items],
            limit=data.limit,
            offset=data.offset,
        )
