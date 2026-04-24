from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import LogoutInput
from kbase.application.services.capability_support import build_repositories
from kbase.application.services.security import AuthenticationError
from kbase.infrastructure.auth.security import hash_token
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def logout_user(
    data: LogoutInput,
    *,
    session_factory: sessionmaker | None = None,
) -> None:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        session_row = repos.security.get_session_by_token_hash(hash_token(data.session_token))
        if session_row is None:
            raise AuthenticationError("Authentication required")
        repos.security.revoke_session(session_row)
