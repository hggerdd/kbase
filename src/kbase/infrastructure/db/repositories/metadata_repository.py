from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ItemMetadataModel, MetadataFieldModel
from kbase.infrastructure.db.repositories.helpers import metadata_value_from_row, new_id, utc_now


class MetadataRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_field_definition(self, field_key: str) -> MetadataFieldModel | None:
        return self.session.get(MetadataFieldModel, field_key)

    def upsert_field(
        self,
        *,
        item_id: str,
        field_key: str,
        values: dict[str, object | None],
        source: str,
        confidence: float | None,
        created_by_principal_id: str | None,
    ) -> ItemMetadataModel:
        stmt = select(ItemMetadataModel).where(
            ItemMetadataModel.item_id == item_id,
            ItemMetadataModel.field_key == field_key,
        )
        row = self.session.scalars(stmt).first()
        now = utc_now()
        if row is None:
            row = ItemMetadataModel(
                id=new_id(),
                item_id=item_id,
                field_key=field_key,
                source=source,
                confidence=confidence,
                created_by_principal_id=created_by_principal_id,
                created_at=now,
                updated_at=now,
            )
            self.session.add(row)
        row.value_text = values["value_text"]
        row.value_number = values["value_number"]
        row.value_integer = values["value_integer"]
        row.value_date = values["value_date"]
        row.value_datetime = values["value_datetime"]
        row.value_bool = values["value_bool"]
        row.value_json = values["value_json"]
        row.source = source
        row.confidence = confidence
        row.created_by_principal_id = created_by_principal_id
        row.updated_at = now
        self.session.flush()
        return row

    def unset_fields(self, item_id: str, field_keys: list[str]) -> None:
        if not field_keys:
            return
        self.session.execute(
            delete(ItemMetadataModel).where(
                ItemMetadataModel.item_id == item_id,
                ItemMetadataModel.field_key.in_(field_keys),
            )
        )
        self.session.flush()

    def list_metadata(self, item_id: str) -> list[tuple[str, str, object, str, float | None]]:
        stmt = (
            select(ItemMetadataModel, MetadataFieldModel)
            .join(MetadataFieldModel, MetadataFieldModel.key == ItemMetadataModel.field_key)
            .where(ItemMetadataModel.item_id == item_id)
            .order_by(ItemMetadataModel.field_key.asc())
        )
        results: list[tuple[str, str, object, str, float | None]] = []
        for row, field in self.session.execute(stmt):
            results.append(
                (
                    row.field_key,
                    field.value_type,
                    metadata_value_from_row(row),
                    row.source,
                    row.confidence,
                )
            )
        return results

