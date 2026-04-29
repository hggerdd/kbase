from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import ItemLinkModel, ItemModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class LinkRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create_link(
        self,
        *,
        from_item_id: str,
        to_item_id: str,
        link_type: str,
        note: str | None,
        created_by_principal_id: str | None,
    ) -> ItemLinkModel:
        link = ItemLinkModel(
            id=new_id(),
            from_item_id=from_item_id,
            to_item_id=to_item_id,
            link_type=link_type,
            source="manual",
            confidence=None,
            note=note,
            created_by_principal_id=created_by_principal_id,
            created_at=utc_now(),
        )
        self.session.add(link)
        self.session.flush()
        return link

    def list_related_items(self, item_id: str) -> list[ItemModel]:
        stmt = (
            select(ItemModel)
            .join(ItemLinkModel, ItemLinkModel.to_item_id == ItemModel.id)
            .where(ItemLinkModel.from_item_id == item_id)
            .order_by(ItemLinkModel.created_at.desc())
        )
        return list(self.session.scalars(stmt))

    def list_links(self, item_id: str) -> list[ItemLinkModel]:
        stmt = select(ItemLinkModel).where(ItemLinkModel.from_item_id == item_id).order_by(
            ItemLinkModel.created_at.desc()
        )
        return list(self.session.scalars(stmt))

    def get_link(self, link_id: str) -> ItemLinkModel | None:
        return self.session.get(ItemLinkModel, link_id)

    def delete_link(self, link: ItemLinkModel) -> None:
        self.session.delete(link)
        self.session.flush()
