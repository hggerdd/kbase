from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import SetUserPreferenceInput, SetUserPreferenceResult
from kbase.application.dto.common import UserPreferenceData
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def _clean_preference_key(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError("Preference key is required")
    return cleaned


def set_user_preference(
    data: SetUserPreferenceInput,
    *,
    session_factory: sessionmaker | None = None,
) -> SetUserPreferenceResult:
    preference_key = _clean_preference_key(data.preference_key)
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        record = repos.preferences.set(data.actor.principal_id, preference_key, data.value)
        record_write(
            repos=repos,
            item_id=None,
            actor_principal_id=data.actor.principal_id,
            operation_key="set_user_preference",
            target_table="user_preferences",
            target_id=f"{record.principal_id}:{record.preference_key}",
            payload_summary=record.preference_key,
            target_object_type="user_preference",
            target_object_id=f"{record.principal_id}:{record.preference_key}",
            target_field_key="value",
            provenance=data.provenance,
        )
        return SetUserPreferenceResult(
            preference=UserPreferenceData(
                preference_key=record.preference_key,
                value=record.value,
                is_set=True,
                updated_at=record.updated_at,
            )
        )
