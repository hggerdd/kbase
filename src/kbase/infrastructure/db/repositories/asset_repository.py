from __future__ import annotations

from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from kbase.infrastructure.db.models.tables import AssetModel, ItemAssetModel
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


class AssetRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def register_asset(
        self,
        *,
        storage_path: str,
        asset_kind: str,
        original_filename: str | None,
        mime_type: str | None,
        size_bytes: int | None,
        checksum_sha256: str | None,
        created_by_principal_id: str | None,
        source_data_class: str,
    ) -> AssetModel:
        asset = self.session.scalars(
            select(AssetModel).where(AssetModel.storage_path == storage_path)
        ).first()
        if asset is not None:
            return asset

        extension = Path(original_filename or storage_path).suffix.lstrip(".") or None
        asset = AssetModel(
            id=new_id(),
            asset_kind=asset_kind,
            storage_path=storage_path,
            original_filename=original_filename,
            extension=extension,
            mime_type=mime_type,
            size_bytes=size_bytes,
            checksum_sha256=checksum_sha256,
            source_data_class=source_data_class,
            created_by_principal_id=created_by_principal_id,
            created_at=utc_now(),
        )
        self.session.add(asset)
        self.session.flush()
        return asset

    def attach_asset(
        self,
        *,
        item_id: str,
        asset_id: str,
        relationship_role: str,
        caption: str | None,
        sort_order: int,
        created_by_principal_id: str | None,
    ) -> ItemAssetModel:
        existing = self.session.scalars(
            select(ItemAssetModel).where(
                ItemAssetModel.item_id == item_id,
                ItemAssetModel.asset_id == asset_id,
                ItemAssetModel.relationship_role == relationship_role,
            )
        ).first()
        if existing is not None:
            return existing

        item_asset = ItemAssetModel(
            id=new_id(),
            item_id=item_id,
            asset_id=asset_id,
            relationship_role=relationship_role,
            caption=caption,
            sort_order=sort_order,
            created_by_principal_id=created_by_principal_id,
            created_at=utc_now(),
        )
        self.session.add(item_asset)
        self.session.flush()
        return item_asset

    def list_assets_for_item(self, item_id: str) -> list[AssetModel]:
        stmt = (
            select(AssetModel)
            .join(ItemAssetModel, ItemAssetModel.asset_id == AssetModel.id)
            .where(ItemAssetModel.item_id == item_id)
            .order_by(ItemAssetModel.sort_order.asc(), ItemAssetModel.created_at.asc())
        )
        return list(self.session.scalars(stmt))

