from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ListProjectItemsInput, ListProjectItemsResult
from kbase.application.services.capability_support import (
    build_repositories,
    principal_scope,
    require_item,
    require_item_read,
)
from kbase.application.services.mappers import to_item_ref, to_item_summary
from kbase.application.services.security import READ_PERMISSIONS
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def list_project_items(
    data: ListProjectItemsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ListProjectItemsResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        project = require_item(repos.items, data.project_id)
        require_item_read(repos, item_id=project.id, actor_principal_id=data.actor.principal_id)
        items = repos.projects.list_project_items(
            data.project_id,
            data.limit,
            data.offset,
            accessible_principal_ids=principal_scope(repos, data.actor.principal_id),
            permission_keys=READ_PERMISSIONS,
        )
        return ListProjectItemsResult(
            project=to_item_ref(project),
            items=[to_item_summary(item) for item in items],
            limit=data.limit,
            offset=data.offset,
        )
