from __future__ import annotations

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ContentPartModel, ProvenanceRecordModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class ProvenanceRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def record(
        self,
        *,
        target_object_type: str,
        target_object_id: str,
        target_field_key: str | None,
        source_object_type: str | None,
        source_object_id: str | None,
        source_uri: str | None,
        method_key: str,
        data_class: str,
        confidence: float | None,
        created_by_principal_id: str | None,
    ) -> ProvenanceRecordModel:
        row = ProvenanceRecordModel(
            id=new_id(),
            target_object_type=target_object_type,
            target_object_id=target_object_id,
            target_field_key=target_field_key,
            source_object_type=source_object_type,
            source_object_id=source_object_id,
            source_uri=source_uri,
            method_key=method_key,
            data_class=data_class,
            confidence=confidence,
            created_by_principal_id=created_by_principal_id,
            created_at=utc_now(),
        )
        self.session.add(row)
        self.session.flush()
        return row

    def get_item_provenance(self, item_id: str) -> list[ProvenanceRecordModel]:
        content_part_ids = list(
            self.session.scalars(
                select(ContentPartModel.id).where(ContentPartModel.item_id == item_id)
            )
        )
        stmt = select(ProvenanceRecordModel).where(
            or_(
                (
                    ProvenanceRecordModel.target_object_type == "item"
                )
                & (ProvenanceRecordModel.target_object_id == item_id),
                (
                    ProvenanceRecordModel.target_object_type == "content_part"
                )
                & (ProvenanceRecordModel.target_object_id.in_(content_part_ids or ["__none__"])),
            )
        ).order_by(ProvenanceRecordModel.created_at.asc(), ProvenanceRecordModel.id.asc())
        return list(self.session.scalars(stmt))

