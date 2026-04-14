from __future__ import annotations

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ContentPartModel, ContentPartVersionModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class ContentRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create_content_part(
        self,
        *,
        item_id: str,
        part_kind: str,
        content_text: str,
        content_format: str,
        source_method: str,
        source_data_class: str,
        created_by_principal_id: str | None,
        sequence_no: int = 0,
    ) -> ContentPartModel:
        now = utc_now()
        content_part = ContentPartModel(
            id=new_id(),
            item_id=item_id,
            part_kind=part_kind,
            sequence_no=sequence_no,
            page_no=None,
            heading_path=None,
            content_text=content_text,
            content_format=content_format,
            source_method=source_method,
            source_data_class=source_data_class,
            language_code=None,
            created_by_principal_id=created_by_principal_id,
            created_at=now,
            updated_at=now,
        )
        self.session.add(content_part)
        self.session.flush()
        self.create_version(
            content_part_id=content_part.id,
            content_text=content_text,
            content_format=content_format,
            change_reason="initial",
            created_by_principal_id=created_by_principal_id,
        )
        return content_part

    def create_version(
        self,
        *,
        content_part_id: str,
        content_text: str,
        content_format: str,
        change_reason: str | None,
        created_by_principal_id: str | None,
    ) -> ContentPartVersionModel:
        stmt: Select[tuple[int | None]] = select(func.max(ContentPartVersionModel.version_no)).where(
            ContentPartVersionModel.content_part_id == content_part_id
        )
        current_version = self.session.execute(stmt).scalar_one()
        version_no = (current_version or 0) + 1
        version = ContentPartVersionModel(
            id=new_id(),
            content_part_id=content_part_id,
            version_no=version_no,
            content_text=content_text,
            content_format=content_format,
            change_reason=change_reason,
            created_by_principal_id=created_by_principal_id,
            created_at=utc_now(),
        )
        self.session.add(version)
        self.session.flush()
        return version

    def get_primary_content_part(
        self,
        *,
        item_id: str,
        part_kind: str = "markdown_body",
    ) -> ContentPartModel | None:
        stmt = (
            select(ContentPartModel)
            .where(ContentPartModel.item_id == item_id, ContentPartModel.part_kind == part_kind)
            .order_by(ContentPartModel.sequence_no.asc())
        )
        return self.session.scalars(stmt).first()

    def list_content_parts(self, item_id: str) -> list[ContentPartModel]:
        stmt = select(ContentPartModel).where(ContentPartModel.item_id == item_id).order_by(
            ContentPartModel.sequence_no.asc()
        )
        return list(self.session.scalars(stmt))

    def replace_content_part(
        self,
        *,
        item_id: str,
        part_kind: str,
        content_text: str,
        content_format: str,
        change_reason: str | None,
        actor_principal_id: str | None,
    ) -> ContentPartModel:
        content_part = self.get_primary_content_part(item_id=item_id, part_kind=part_kind)
        if content_part is None:
            return self.create_content_part(
                item_id=item_id,
                part_kind=part_kind,
                content_text=content_text,
                content_format=content_format,
                source_method="manual",
                source_data_class="canonical",
                created_by_principal_id=actor_principal_id,
                sequence_no=0,
            )

        content_part.content_text = content_text
        content_part.content_format = content_format
        content_part.updated_at = utc_now()
        self.session.flush()
        self.create_version(
            content_part_id=content_part.id,
            content_text=content_text,
            content_format=content_format,
            change_reason=change_reason,
            created_by_principal_id=actor_principal_id,
        )
        return content_part

