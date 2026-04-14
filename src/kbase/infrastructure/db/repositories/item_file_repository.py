from __future__ import annotations

from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ItemFileModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class ItemFileRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create_file(
        self,
        *,
        item_id: str,
        file_role: str,
        relative_path: str,
        original_filename: str | None,
        mime_type: str | None,
        size_bytes: int | None,
        checksum_sha256: str | None,
        source_data_class: str,
        created_by_principal_id: str | None,
    ) -> ItemFileModel:
        existing = self.session.scalars(
            select(ItemFileModel).where(ItemFileModel.relative_path == relative_path)
        ).first()
        if existing is not None:
            return existing

        extension = Path(original_filename or relative_path).suffix.lstrip(".") or None
        item_file = ItemFileModel(
            id=new_id(),
            item_id=item_id,
            file_role=file_role,
            relative_path=relative_path,
            original_filename=original_filename,
            extension=extension,
            mime_type=mime_type,
            size_bytes=size_bytes,
            checksum_sha256=checksum_sha256,
            source_data_class=source_data_class,
            created_by_principal_id=created_by_principal_id,
            created_at=utc_now(),
        )
        self.session.add(item_file)
        self.session.flush()
        return item_file

    def list_files_for_item(self, item_id: str) -> list[ItemFileModel]:
        stmt = (
            select(ItemFileModel)
            .where(ItemFileModel.item_id == item_id)
            .order_by(ItemFileModel.created_at.asc())
        )
        return list(self.session.scalars(stmt))
