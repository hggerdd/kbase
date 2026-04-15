from __future__ import annotations

import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ItemLabelModel, LabelNodeModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class LabelRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def _normalize_path(self, full_path: str) -> str:
        parts = [part.strip() for part in str(full_path).split("/") if part.strip()]
        if not parts:
            raise ValueError("Label path must not be empty")
        return "/".join(parts)

    def _get_by_full_path(self, full_path: str) -> LabelNodeModel | None:
        normalized = self._normalize_path(full_path)
        return self.session.scalars(
            select(LabelNodeModel).where(LabelNodeModel.full_path == normalized)
        ).first()

    def get(self, label_id: str) -> LabelNodeModel | None:
        return self.session.get(LabelNodeModel, label_id)

    def get_or_create_label_path(self, full_path: str) -> LabelNodeModel:
        normalized_path = self._normalize_path(full_path)
        existing = self._get_by_full_path(normalized_path)
        if existing is not None:
            return existing

        parent_id = None
        current_path: list[str] = []
        node: LabelNodeModel | None = None
        now = utc_now()
        for depth, part in enumerate(normalized_path.split("/")):
            current_path.append(part)
            path = "/".join(current_path)
            node = self._get_by_full_path(path)
            if node is None:
                node = LabelNodeModel(
                    id=new_id(),
                    name=part,
                    full_path=path,
                    parent_id=parent_id,
                    description=None,
                    depth=depth,
                    meta_json=None,
                    is_active=1,
                    created_at=now,
                    updated_at=now,
                )
                self.session.add(node)
                self.session.flush()
            parent_id = node.id
        assert node is not None
        return node

    def create_label(
        self,
        *,
        name: str,
        parent_id: str | None,
        description: str | None,
        meta: dict,
    ) -> LabelNodeModel:
        normalized_name = str(name).strip()
        if not normalized_name:
            raise ValueError("Label name must not be empty")
        if "/" in normalized_name:
            raise ValueError("Label name must not contain '/'")

        parent = None
        parent_path = ""
        depth = 0
        if parent_id:
            parent = self.get(parent_id)
            if parent is None:
                raise ValueError(f"Label '{parent_id}' not found")
            if not parent.is_active:
                raise ValueError("Cannot create a child under an inactive label")
            parent_path = parent.full_path
            depth = parent.depth + 1

        full_path = f"{parent_path}/{normalized_name}" if parent_path else normalized_name
        if self._get_by_full_path(full_path) is not None:
            raise ValueError(f"Label path '{full_path}' already exists")

        now = utc_now()
        node = LabelNodeModel(
            id=new_id(),
            name=normalized_name,
            full_path=full_path,
            parent_id=parent.id if parent else None,
            description=description,
            depth=depth,
            meta_json=json.dumps(meta, sort_keys=True) if meta else None,
            is_active=1,
            created_at=now,
            updated_at=now,
        )
        self.session.add(node)
        self.session.flush()
        return node

    def rename_label(self, *, label_id: str, name: str) -> LabelNodeModel:
        node = self.get(label_id)
        if node is None:
            raise ValueError(f"Label '{label_id}' not found")

        normalized_name = str(name).strip()
        if not normalized_name:
            raise ValueError("Label name must not be empty")
        if "/" in normalized_name:
            raise ValueError("Label name must not contain '/'")
        if node.name == normalized_name:
            return node

        parent_path = ""
        if node.parent_id:
            parent = self.get(node.parent_id)
            if parent is None:
                raise ValueError(f"Parent label '{node.parent_id}' not found")
            parent_path = parent.full_path

        new_full_path = f"{parent_path}/{normalized_name}" if parent_path else normalized_name
        existing = self._get_by_full_path(new_full_path)
        if existing is not None and existing.id != node.id:
            raise ValueError(f"Label path '{new_full_path}' already exists")

        old_prefix = node.full_path
        descendants = list(
            self.session.scalars(
                select(LabelNodeModel)
                .where(
                    (LabelNodeModel.full_path == old_prefix)
                    | (LabelNodeModel.full_path.like(f"{old_prefix}/%"))
                )
                .order_by(LabelNodeModel.depth.asc(), LabelNodeModel.full_path.asc())
            )
        )
        now = utc_now()
        for descendant in descendants:
            suffix = descendant.full_path[len(old_prefix):]
            descendant.full_path = f"{new_full_path}{suffix}"
            if descendant.id == node.id:
                descendant.name = normalized_name
            descendant.updated_at = now
        self.session.flush()
        return node

    def update_label(
        self,
        *,
        label_id: str,
        name: str | None,
        description: str | None,
        description_provided: bool,
    ) -> LabelNodeModel:
        node = self.get(label_id)
        if node is None:
            raise ValueError(f"Label '{label_id}' not found")

        if name is not None:
            node = self.rename_label(label_id=label_id, name=name)
        if description_provided:
            node.description = description
            node.updated_at = utc_now()
            self.session.flush()
        return node

    def delete_label_tree(self, *, label_id: str) -> list[LabelNodeModel]:
        node = self.get(label_id)
        if node is None:
            raise ValueError(f"Label '{label_id}' not found")

        prefix = node.full_path
        descendants = list(
            self.session.scalars(
                select(LabelNodeModel)
                .where(
                    (LabelNodeModel.full_path == prefix)
                    | (LabelNodeModel.full_path.like(f"{prefix}/%"))
                )
                .order_by(LabelNodeModel.depth.desc(), LabelNodeModel.full_path.desc())
            )
        )
        descendant_ids = [descendant.id for descendant in descendants]
        if descendant_ids:
            self.session.query(ItemLabelModel).filter(
                ItemLabelModel.label_id.in_(descendant_ids)
            ).delete(synchronize_session=False)
            for descendant in descendants:
                self.session.query(LabelNodeModel).filter(
                    LabelNodeModel.id == descendant.id
                ).delete(synchronize_session=False)
        self.session.flush()
        return descendants

    def deactivate_label(self, *, label_id: str) -> LabelNodeModel:
        node = self.get(label_id)
        if node is None:
            raise ValueError(f"Label '{label_id}' not found")
        prefix = node.full_path
        now = utc_now()
        descendants = list(
            self.session.scalars(
                select(LabelNodeModel).where(
                    (LabelNodeModel.full_path == prefix)
                    | (LabelNodeModel.full_path.like(f"{prefix}/%"))
                )
            )
        )
        for descendant in descendants:
            descendant.is_active = 0
            descendant.updated_at = now
        self.session.flush()
        return node

    def reactivate_label(self, *, label_id: str) -> LabelNodeModel:
        node = self.get(label_id)
        if node is None:
            raise ValueError(f"Label '{label_id}' not found")

        if node.parent_id:
            parent = self.get(node.parent_id)
            if parent is None:
                raise ValueError(f"Parent label '{node.parent_id}' not found")
            if not parent.is_active:
                raise ValueError("Cannot reactivate a label below an inactive parent")

        prefix = node.full_path
        now = utc_now()
        descendants = list(
            self.session.scalars(
                select(LabelNodeModel).where(
                    (LabelNodeModel.full_path == prefix)
                    | (LabelNodeModel.full_path.like(f"{prefix}/%"))
                )
            )
        )
        for descendant in descendants:
            descendant.is_active = 1
            descendant.updated_at = now
        self.session.flush()
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

    def list_labels(
        self,
        *,
        query: str | None = None,
        limit: int = 100,
        include_inactive: bool = False,
        parent_id: str | None = None,
        full_path_prefix: str | None = None,
    ) -> list[LabelNodeModel]:
        stmt = select(LabelNodeModel)
        if not include_inactive:
            stmt = stmt.where(LabelNodeModel.is_active == 1)
        if query:
            stmt = stmt.where(LabelNodeModel.full_path.ilike(f"%{query}%"))
        if parent_id is not None:
            stmt = stmt.where(LabelNodeModel.parent_id == parent_id)
        if full_path_prefix:
            normalized_prefix = self._normalize_path(full_path_prefix)
            stmt = stmt.where(
                (LabelNodeModel.full_path == normalized_prefix)
                | (LabelNodeModel.full_path.like(f"{normalized_prefix}/%"))
            )
        stmt = stmt.order_by(LabelNodeModel.full_path.asc()).limit(limit)
        return list(self.session.scalars(stmt))
