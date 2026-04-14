from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ItemLabelModel, LabelNodeModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class LabelRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_or_create_label_path(self, full_path: str) -> LabelNodeModel:
        existing = self.session.scalars(
            select(LabelNodeModel).where(LabelNodeModel.full_path == full_path)
        ).first()
        if existing is not None:
            return existing

        parent_id = None
        current_path = []
        node: LabelNodeModel | None = None
        now = utc_now()
        for part in [p for p in full_path.split("/") if p]:
            current_path.append(part)
            path = "/".join(current_path)
            node = self.session.scalars(
                select(LabelNodeModel).where(LabelNodeModel.full_path == path)
            ).first()
            if node is None:
                node = LabelNodeModel(
                    id=new_id(),
                    name=part,
                    full_path=path,
                    parent_id=parent_id,
                    description=None,
                    is_active=1,
                    created_at=now,
                    updated_at=now,
                )
                self.session.add(node)
                self.session.flush()
            parent_id = node.id
        assert node is not None
        return node

    def assign_labels(
        self,
        *,
        item_id: str,
        label_paths: list[str],
        created_by_principal_id: str | None,
    ) -> list[LabelNodeModel]:
        now = utc_now()
        labels: list[LabelNodeModel] = []
        for label_path in sorted(set(label_paths)):
            node = self.get_or_create_label_path(label_path)
            labels.append(node)
            existing = self.session.scalars(
                select(ItemLabelModel).where(
                    ItemLabelModel.item_id == item_id,
                    ItemLabelModel.label_id == node.id,
                )
            ).first()
            if existing is None:
                self.session.add(
                    ItemLabelModel(
                        item_id=item_id,
                        label_id=node.id,
                        source="manual",
                        confidence=None,
                        created_by_principal_id=created_by_principal_id,
                        created_at=now,
                    )
                )
        self.session.flush()
        return labels

    def replace_labels(
        self,
        *,
        item_id: str,
        label_paths: list[str],
        created_by_principal_id: str | None,
    ) -> list[LabelNodeModel]:
        desired_paths = sorted(set(label_paths))
        existing_labels = self.list_labels_for_item(item_id)
        existing_ids_by_path = {label.full_path: label.id for label in existing_labels}
        desired_ids = {
            existing_ids_by_path[path]
            for path in desired_paths
            if path in existing_ids_by_path
        }
        for label_path in desired_paths:
            if label_path not in existing_ids_by_path:
                desired_ids.add(self.get_or_create_label_path(label_path).id)

        self.session.query(ItemLabelModel).filter(ItemLabelModel.item_id == item_id).delete(
            synchronize_session=False
        )
        if desired_paths:
            self.assign_labels(
                item_id=item_id,
                label_paths=desired_paths,
                created_by_principal_id=created_by_principal_id,
            )
        self.session.flush()
        return self.list_labels_for_item(item_id)

    def list_labels_for_item(self, item_id: str) -> list[LabelNodeModel]:
        stmt = (
            select(LabelNodeModel)
            .join(ItemLabelModel, ItemLabelModel.label_id == LabelNodeModel.id)
            .where(ItemLabelModel.item_id == item_id)
            .order_by(LabelNodeModel.full_path.asc())
        )
        return list(self.session.scalars(stmt))

    def list_labels(self, query: str | None = None, limit: int = 100) -> list[LabelNodeModel]:
        stmt = select(LabelNodeModel).where(LabelNodeModel.is_active == 1)
        if query:
            stmt = stmt.where(LabelNodeModel.full_path.ilike(f"%{query}%"))
        stmt = stmt.order_by(LabelNodeModel.full_path.asc()).limit(limit)
        return list(self.session.scalars(stmt))
