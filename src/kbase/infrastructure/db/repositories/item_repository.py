from __future__ import annotations

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ItemCategoryModel, ItemClassificationModel, ItemModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class ItemRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        title: str,
        item_kind: str,
        category_key: str | None,
        status: str | None,
        origin: str,
        language_code: str | None,
        created_by_principal_id: str | None,
        parent_item_id: str | None = None,
    ) -> ItemModel:
        now = utc_now()
        item = ItemModel(
            id=new_id(),
            title=title,
            item_kind=item_kind,
            category_key=category_key,
            status=status,
            origin=origin,
            language_code=language_code,
            created_by_principal_id=created_by_principal_id,
            parent_item_id=parent_item_id,
            is_archived=0,
            created_at=now,
            updated_at=now,
            archived_at=None,
        )
        self.session.add(item)
        self.session.flush()
        return item

    def get(self, item_id: str) -> ItemModel | None:
        return self.session.get(ItemModel, item_id)

    def list(
        self,
        *,
        item_kind: str | None = None,
        category_key: str | None = None,
        include_archived: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ItemModel]:
        stmt: Select[tuple[ItemModel]] = select(ItemModel)
        if item_kind:
            stmt = stmt.where(ItemModel.item_kind == item_kind)
        if category_key:
            stmt = stmt.where(ItemModel.category_key == category_key)
        if not include_archived:
            stmt = stmt.where(ItemModel.is_archived == 0)
        stmt = stmt.order_by(ItemModel.updated_at.desc()).limit(limit).offset(offset)
        return list(self.session.scalars(stmt))

    def update_core(
        self,
        item: ItemModel,
        *,
        title: str | None,
        category_key: str | None,
        status: str | None,
        language_code: str | None,
        is_archived: bool | None,
    ) -> ItemModel:
        if title is not None:
            item.title = title
        if category_key is not None:
            item.category_key = category_key
        if status is not None:
            item.status = status
        if language_code is not None:
            item.language_code = language_code
        if is_archived is not None:
            item.is_archived = 1 if is_archived else 0
            item.archived_at = utc_now() if is_archived else None
        item.updated_at = utc_now()
        self.session.flush()
        return item

    def get_category(self, category_key: str) -> ItemCategoryModel | None:
        return self.session.get(ItemCategoryModel, category_key)

    def list_categories(
        self,
        *,
        query: str | None = None,
        applies_to_kind: str | None = None,
        include_inactive: bool = False,
    ) -> list[ItemCategoryModel]:
        stmt = select(ItemCategoryModel)
        if query:
            like_query = f"%{query}%"
            stmt = stmt.where(
                (ItemCategoryModel.key.ilike(like_query))
                | (ItemCategoryModel.label.ilike(like_query))
                | (ItemCategoryModel.description.ilike(like_query))
            )
        if applies_to_kind:
            stmt = stmt.where(ItemCategoryModel.applies_to_kind == applies_to_kind)
        if not include_inactive:
            stmt = stmt.where(ItemCategoryModel.is_active == 1)
        stmt = stmt.order_by(ItemCategoryModel.applies_to_kind.asc(), ItemCategoryModel.label.asc())
        return list(self.session.scalars(stmt))

    def create_category(
        self,
        *,
        key: str,
        label: str,
        description: str | None,
        applies_to_kind: str | None,
    ) -> ItemCategoryModel:
        category = ItemCategoryModel(
            key=key,
            label=label,
            description=description,
            applies_to_kind=applies_to_kind,
            is_active=1,
        )
        self.session.add(category)
        self.session.flush()
        return category

    def update_category(
        self,
        category: ItemCategoryModel,
        *,
        label: str | None,
        description: str | None,
        description_provided: bool,
        applies_to_kind: str | None,
        applies_to_kind_provided: bool,
        is_active: bool | None,
    ) -> ItemCategoryModel:
        if label is not None:
            category.label = label
        if description_provided:
            category.description = description
        if applies_to_kind_provided:
            category.applies_to_kind = applies_to_kind
        if is_active is not None:
            category.is_active = 1 if is_active else 0
        self.session.flush()
        return category

    def set_classifications(
        self,
        *,
        item_id: str,
        secondary_category_keys: list[str],
        created_by_principal_id: str | None,
    ) -> None:
        self.session.query(ItemClassificationModel).filter(
            ItemClassificationModel.item_id == item_id
        ).delete()
        now = utc_now()
        for category_key in secondary_category_keys:
            self.session.add(
                ItemClassificationModel(
                    item_id=item_id,
                    category_key=category_key,
                    classification_role="secondary",
                    created_by_principal_id=created_by_principal_id,
                    created_at=now,
                )
            )
        self.session.flush()

    def get_classifications(self, item_id: str) -> list[str]:
        stmt = select(ItemClassificationModel.category_key).where(
            ItemClassificationModel.item_id == item_id
        )
        return list(self.session.scalars(stmt))
