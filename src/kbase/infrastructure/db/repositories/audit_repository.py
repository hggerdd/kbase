from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import AuditEventModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class AuditRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def record_event(
        self,
        *,
        item_id: str | None,
        actor_principal_id: str | None,
        operation_key: str,
        target_table: str,
        target_id: str,
        payload_summary: str | None,
    ) -> AuditEventModel:
        event = AuditEventModel(
            id=new_id(),
            item_id=item_id,
            actor_principal_id=actor_principal_id,
            operation_key=operation_key,
            target_table=target_table,
            target_id=target_id,
            payload_summary=payload_summary,
            occurred_at=utc_now(),
        )
        self.session.add(event)
        self.session.flush()
        return event

    def get_item_history(self, item_id: str) -> list[AuditEventModel]:
        stmt = select(AuditEventModel).where(AuditEventModel.item_id == item_id).order_by(
            AuditEventModel.occurred_at.asc(), AuditEventModel.id.asc()
        )
        return list(self.session.scalars(stmt))

