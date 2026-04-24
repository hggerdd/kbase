from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import GetSessionInput
from kbase.application.dto.common import SessionData
from kbase.application.services.capability_support import build_repositories
from kbase.application.services.security import resolve_session
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def get_current_session(
    data: GetSessionInput,
    *,
    session_factory: sessionmaker | None = None,
) -> SessionData:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        return resolve_session(
            repos=repos,
            session_token=data.session_token,
            api_token=data.api_token,
        )
