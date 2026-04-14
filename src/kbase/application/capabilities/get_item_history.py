from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import GetItemHistoryResult
from kbase.application.dto.capabilities import GetItemInput
from kbase.application.services.capability_support import build_repositories, require_item
from kbase.application.services.mappers import to_audit_event_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def get_item_history(
    data: GetItemInput,
    *,
    session_factory: sessionmaker | None = None,
) -> GetItemHistoryResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.item_id)
        events = repos.audit.get_item_history(data.item_id)
        return GetItemHistoryResult(
            item_id=data.item_id,
            events=[to_audit_event_data(event) for event in events],
        )

