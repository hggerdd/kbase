from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import CreateApiTokenInput, CreateApiTokenResult
from kbase.application.services.capability_support import build_repositories
from kbase.application.services.mappers import to_api_token_data
from kbase.application.services.security import create_api_token_for_actor
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def create_api_token(
    data: CreateApiTokenInput,
    *,
    session_factory: sessionmaker | None = None,
) -> CreateApiTokenResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        token, secret = create_api_token_for_actor(
            repos=repos,
            actor=data.actor,
            token_label=data.token_label,
        )
        return CreateApiTokenResult(token=to_api_token_data(token), secret=secret)
