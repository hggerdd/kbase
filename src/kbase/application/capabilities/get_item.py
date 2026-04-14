from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import GetItemInput, ItemDetailResult
from kbase.application.services.capability_support import build_repositories, require_item
from kbase.application.services.mappers import (
    to_asset_data,
    to_content_part_data,
    to_item_file_data,
    to_item_ref,
    to_item_summary,
    to_label_data,
    to_link_data,
)
from kbase.infrastructure.db.models.tables import ItemMetadataModel, MetadataFieldModel
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork
from kbase.infrastructure.db.repositories.helpers import metadata_value_from_row


def get_item(
    data: GetItemInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemDetailResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        item = require_item(repos.items, data.item_id)
        primary = repos.content.get_primary_content_part(item_id=item.id)
        content_parts = repos.content.list_content_parts(item.id)
        item_files = repos.item_files.list_files_for_item(item.id)
        labels = repos.labels.list_labels_for_item(item.id)
        classifications = repos.items.get_classifications(item.id)
        assets = repos.assets.list_assets_for_item(item.id)
        related_items = repos.links.list_related_items(item.id)
        outgoing_links = repos.links.list_links(item.id)
        projects = repos.projects.list_projects_for_item(item.id)
        stmt = (
            select(ItemMetadataModel, MetadataFieldModel)
            .join(MetadataFieldModel, MetadataFieldModel.key == ItemMetadataModel.field_key)
            .where(ItemMetadataModel.item_id == item.id)
            .order_by(ItemMetadataModel.field_key.asc())
        )
        metadata_entries = []
        for row, field in uow.session.execute(stmt):
            metadata_entries.append(
                {
                    "field_key": row.field_key,
                    "value_type": field.value_type,
                    "value": metadata_value_from_row(row),
                    "source": row.source,
                    "confidence": row.confidence,
                }
            )
        return ItemDetailResult(
            item=to_item_summary(item),
            primary_content_part=to_content_part_data(primary) if primary else None,
            content_parts=[to_content_part_data(part) for part in content_parts],
            labels=[to_label_data(label) for label in labels],
            classifications=classifications,
            metadata=metadata_entries,
            files=[to_item_file_data(item_file) for item_file in item_files],
            outgoing_links=[to_link_data(link) for link in outgoing_links],
            linked_assets=[to_asset_data(asset) for asset in assets],
            related_items=[to_item_ref(related) for related in related_items],
            projects=[to_item_ref(project) for project in projects],
        )
