from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ReplaceItemAclInput
from kbase.application.dto.common import AclEntryData
from kbase.application.services.capability_support import (
    build_repositories,
    require_item,
    require_item_manage,
)
from kbase.application.services.mappers import to_acl_entry_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def replace_item_acl(
    data: ReplaceItemAclInput,
    *,
    session_factory: sessionmaker | None = None,
) -> list[AclEntryData]:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.item_id)
        require_item_manage(repos, item_id=data.item_id, actor_principal_id=data.actor.principal_id)
        entries = repos.security.replace_item_acl(
            item_id=data.item_id,
            entries=[(grant.principal_id, grant.permission_key) for grant in data.grants],
            granted_by_principal_id=data.actor.principal_id,
        )
        return [to_acl_entry_data(entry) for entry in entries]
