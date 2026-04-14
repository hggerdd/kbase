from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ItemModel, ProjectItemModel
from kbase.infrastructure.db.repositories.helpers import utc_now


class ProjectRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add_item_to_project(
        self,
        *,
        project_id: str,
        item_id: str,
        role: str | None,
        sort_order: int,
        added_by_principal_id: str | None,
    ) -> ProjectItemModel:
        existing = self.session.scalars(
            select(ProjectItemModel).where(
                ProjectItemModel.project_id == project_id,
                ProjectItemModel.item_id == item_id,
            )
        ).first()
        if existing is not None:
            return existing

        row = ProjectItemModel(
            project_id=project_id,
            item_id=item_id,
            role=role,
            sort_order=sort_order,
            added_by_principal_id=added_by_principal_id,
            created_at=utc_now(),
        )
        self.session.add(row)
        self.session.flush()
        return row

    def list_project_items(self, project_id: str, limit: int, offset: int) -> list[ItemModel]:
        stmt = (
            select(ItemModel)
            .join(ProjectItemModel, ProjectItemModel.item_id == ItemModel.id)
            .where(ProjectItemModel.project_id == project_id)
            .order_by(ProjectItemModel.sort_order.asc(), ProjectItemModel.created_at.asc())
            .limit(limit)
            .offset(offset)
        )
        return list(self.session.scalars(stmt))

    def list_projects_for_item(self, item_id: str) -> list[ItemModel]:
        stmt = (
            select(ItemModel)
            .join(ProjectItemModel, ProjectItemModel.project_id == ItemModel.id)
            .where(ProjectItemModel.item_id == item_id)
            .order_by(ItemModel.updated_at.desc())
        )
        return list(self.session.scalars(stmt))

