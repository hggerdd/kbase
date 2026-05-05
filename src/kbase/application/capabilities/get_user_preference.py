from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import GetUserPreferenceInput
from kbase.application.dto.common import UserPreferenceData
from kbase.application.services.capability_support import build_repositories
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def _clean_preference_key(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError("Preference key is required")
    return cleaned


def get_user_preference(
    data: GetUserPreferenceInput,
    *,
    session_factory: sessionmaker | None = None,
) -> UserPreferenceData:
    preference_key = _clean_preference_key(data.preference_key)
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        record = repos.preferences.get(data.actor.principal_id, preference_key)
        if record is None:
            return UserPreferenceData(
                preference_key=preference_key,
                value=None,
                is_set=False,
                updated_at=None,
            )
        return UserPreferenceData(
            preference_key=record.preference_key,
            value=record.value,
            is_set=True,
            updated_at=record.updated_at,
        )
