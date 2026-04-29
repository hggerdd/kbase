from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ReplaceItemProjectsInput
from kbase.application.dto.common import ItemRef
from kbase.application.services.capability_support import (
    build_repositories,
    record_write,
    require_item,
    require_item_write,
)
from kbase.application.services.mappers import to_item_ref
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def replace_item_projects(
    data: ReplaceItemProjectsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemRef:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        item = require_item(repos.items, data.item_id)
        require_item_write(repos, item_id=item.id, actor_principal_id=data.actor.principal_id)

        current_projects = repos.projects.list_projects_for_item(item.id)
        for project in current_projects:
            require_item_write(repos, item_id=project.id, actor_principal_id=data.actor.principal_id)

        validated_project_ids = []
        for project_id in data.project_ids:
            project = require_item(repos.items, project_id)
            require_item_write(repos, item_id=project.id, actor_principal_id=data.actor.principal_id)
            if project.item_kind != "project":
                raise ValueError(f"Item '{project_id}' is not a project")
            validated_project_ids.append(project.id)

        deduplicated_project_ids = list(dict.fromkeys(validated_project_ids))
        repos.projects.replace_item_projects(
            item_id=item.id,
            project_ids=deduplicated_project_ids,
            added_by_principal_id=data.actor.principal_id,
        )
        record_write(
            repos=repos,
            item_id=item.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="replace_item_projects",
            target_table="project_items",
            target_id=item.id,
            payload_summary=",".join(deduplicated_project_ids) or None,
            target_object_type="item",
            target_object_id=item.id,
            target_field_key="project_items",
            provenance=data.provenance,
        )
        return to_item_ref(item)
