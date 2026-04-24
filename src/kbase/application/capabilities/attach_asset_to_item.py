from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import AttachAssetToItemInput
from kbase.application.dto.common import AssetData
from kbase.application.services.capability_support import (
    build_repositories,
    record_write,
    require_item,
    require_item_write,
)
from kbase.application.services.mappers import to_asset_data
from kbase.infrastructure.db.models.tables import AssetModel
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def attach_asset_to_item(
    data: AttachAssetToItemInput,
    *,
    session_factory: sessionmaker | None = None,
) -> AssetData:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.item_id)
        require_item_write(repos, item_id=data.item_id, actor_principal_id=data.actor.principal_id)
        asset = uow.session.get(AssetModel, data.asset_id)
        if asset is None:
            raise ValueError(f"Asset '{data.asset_id}' not found")
        repos.assets.attach_asset(
            item_id=data.item_id,
            asset_id=data.asset_id,
            relationship_role=data.relationship_role,
            caption=data.caption,
            sort_order=data.sort_order or 0,
            created_by_principal_id=data.actor.principal_id,
        )
        record_write(
            repos=repos,
            item_id=data.item_id,
            actor_principal_id=data.actor.principal_id,
            operation_key="attach_asset_to_item",
            target_table="item_assets",
            target_id=data.item_id,
            payload_summary=data.relationship_role,
            target_object_type="item",
            target_object_id=data.item_id,
            target_field_key="assets",
            provenance=data.provenance,
        )
        return to_asset_data(asset)
