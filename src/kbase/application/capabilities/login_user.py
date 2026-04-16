from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import LoginInput, LoginResult
from kbase.application.services.capability_support import build_repositories
from kbase.application.services.security import login_with_password
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def login_user(
    data: LoginInput,
    *,
    session_factory: sessionmaker | None = None,
) -> LoginResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        session, session_token = login_with_password(
            repos=repos,
            username=data.username,
            password=data.password,
        )
        return LoginResult(session=session, session_token=session_token)
