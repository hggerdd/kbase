from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import UnlinkItemsInput
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


def unlink_items(
    data: UnlinkItemsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemRef:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        link = repos.links.get_link(data.link_id)
        if link is None:
            raise ValueError(f"Link '{data.link_id}' not found")

        source = require_item(repos.items, link.from_item_id)
        target = require_item(repos.items, link.to_item_id)
        require_item_write(repos, item_id=source.id, actor_principal_id=data.actor.principal_id)
        require_item_read(repos, item_id=target.id, actor_principal_id=data.actor.principal_id)

        link_type = link.link_type
        repos.links.delete_link(link)
        record_write(
            repos=repos,
            item_id=source.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="unlink_items",
            target_table="item_links",
            target_id=data.link_id,
            payload_summary=link_type,
            target_object_type="item",
            target_object_id=source.id,
            target_field_key="links",
            provenance=data.provenance,
        )
        return to_item_ref(source)
