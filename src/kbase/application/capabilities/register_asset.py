from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import RegisterAssetInput
from kbase.application.dto.common import AssetData
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.application.services.mappers import to_asset_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def register_asset(
    data: RegisterAssetInput,
    *,
    session_factory: sessionmaker | None = None,
) -> AssetData:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        asset = repos.assets.register_asset(
            storage_path=data.storage_path,
            asset_kind=data.asset_kind,
            original_filename=data.original_filename,
            mime_type=data.mime_type,
            size_bytes=data.size_bytes,
            checksum_sha256=data.checksum_sha256,
            created_by_principal_id=data.actor.principal_id,
            source_data_class=data.provenance.data_class,
        )
        record_write(
            repos=repos,
            item_id=None,
            actor_principal_id=data.actor.principal_id,
            operation_key="register_asset",
            target_table="assets",
            target_id=asset.id,
            payload_summary=data.storage_path,
            target_object_type="asset",
            target_object_id=asset.id,
            target_field_key=None,
            provenance=data.provenance,
        )
        return to_asset_data(asset)

