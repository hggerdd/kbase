from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import UserPreferenceModel
from kbase.infrastructure.db.repositories.helpers import utc_now


@dataclass(slots=True)
class UserPreferenceRecord:
    principal_id: str
    preference_key: str
    value: Any
    created_at: str
    updated_at: str


class UserPreferenceRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, principal_id: str, preference_key: str) -> UserPreferenceRecord | None:
        row = self.session.get(UserPreferenceModel, (principal_id, preference_key))
        if row is None:
            return None
        return UserPreferenceRecord(
            principal_id=row.principal_id,
            preference_key=row.preference_key,
            value=json.loads(row.value_json),
            created_at=row.created_at,
            updated_at=row.updated_at,
        )

    def set(self, principal_id: str, preference_key: str, value: Any) -> UserPreferenceRecord:
        now = utc_now()
        row = self.session.get(UserPreferenceModel, (principal_id, preference_key))
        value_json = json.dumps(value)
        if row is None:
            row = UserPreferenceModel(
                principal_id=principal_id,
                preference_key=preference_key,
                value_json=value_json,
                created_at=now,
                updated_at=now,
            )
            self.session.add(row)
        else:
            row.value_json = value_json
            row.updated_at = now
        self.session.flush()
        return UserPreferenceRecord(
            principal_id=row.principal_id,
            preference_key=row.preference_key,
            value=json.loads(row.value_json),
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
