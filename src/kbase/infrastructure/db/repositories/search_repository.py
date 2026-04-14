from __future__ import annotations

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import (
    ContentPartModel,
    ItemLabelModel,
    ItemModel,
    LabelNodeModel,
    ProjectItemModel,
)


class SearchRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def search_items(
        self,
        *,
        query: str | None,
        item_kinds: list[str],
        category_keys: list[str],
        label_paths: list[str],
        statuses: list[str],
        created_by_principal_ids: list[str],
        project_id: str | None,
        include_archived: bool,
        limit: int,
        offset: int,
    ) -> list[tuple[ItemModel, str | None]]:
        stmt: Select[tuple[ItemModel]] = select(ItemModel).distinct()
        if query:
            stmt = stmt.outerjoin(ContentPartModel, ContentPartModel.item_id == ItemModel.id).where(
                (ItemModel.title.ilike(f"%{query}%"))
                | (ContentPartModel.content_text.ilike(f"%{query}%"))
            )
        if item_kinds:
            stmt = stmt.where(ItemModel.item_kind.in_(item_kinds))
        if category_keys:
            stmt = stmt.where(ItemModel.category_key.in_(category_keys))
        if statuses:
            stmt = stmt.where(ItemModel.status.in_(statuses))
        if created_by_principal_ids:
            stmt = stmt.where(ItemModel.created_by_principal_id.in_(created_by_principal_ids))
        if project_id:
            stmt = stmt.join(ProjectItemModel, ProjectItemModel.item_id == ItemModel.id).where(
                ProjectItemModel.project_id == project_id
            )
        if label_paths:
            stmt = (
                stmt.join(ItemLabelModel, ItemLabelModel.item_id == ItemModel.id)
                .join(LabelNodeModel, LabelNodeModel.id == ItemLabelModel.label_id)
                .where(LabelNodeModel.full_path.in_(label_paths))
            )
        if not include_archived:
            stmt = stmt.where(ItemModel.is_archived == 0)
        stmt = stmt.order_by(ItemModel.updated_at.desc()).limit(limit).offset(offset)
        items = list(self.session.scalars(stmt))
        return [(item, "text" if query else "filter") for item in items]

