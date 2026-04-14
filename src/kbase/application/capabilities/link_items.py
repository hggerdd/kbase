from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import LinkItemsInput
from kbase.application.dto.common import ItemRef
from kbase.application.services.capability_support import build_repositories, record_write, require_item
from kbase.application.services.mappers import to_item_ref
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def link_items(
    data: LinkItemsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemRef:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.from_item_id)
        target = require_item(repos.items, data.to_item_id)
        repos.links.create_link(
            from_item_id=data.from_item_id,
            to_item_id=data.to_item_id,
            link_type=data.link_type,
            note=data.note,
            created_by_principal_id=data.actor.principal_id,
        )
        record_write(
            repos=repos,
            item_id=data.from_item_id,
            actor_principal_id=data.actor.principal_id,
            operation_key="link_items",
            target_table="item_links",
            target_id=data.from_item_id,
            payload_summary=data.link_type,
            target_object_type="item",
            target_object_id=data.from_item_id,
            target_field_key="links",
            provenance=data.provenance,
        )
        return to_item_ref(target)

