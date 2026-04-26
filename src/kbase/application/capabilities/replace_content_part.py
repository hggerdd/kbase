from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ReplaceContentPartInput
from kbase.application.dto.common import ContentPartData
from kbase.application.services.capability_support import (
    build_repositories,
    record_write,
    require_item,
    require_item_write,
)
from kbase.application.services.errors import ConflictError
from kbase.application.services.mappers import to_content_part_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def replace_content_part(
    data: ReplaceContentPartInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ContentPartData:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.item_id)
        require_item_write(repos, item_id=data.item_id, actor_principal_id=data.actor.principal_id)
        current_content_part = repos.content.get_primary_content_part(
            item_id=data.item_id,
            part_kind=data.part_kind,
        )
        if data.expected_content_updated_at is not None:
            if current_content_part is None or current_content_part.updated_at != data.expected_content_updated_at:
                raise ConflictError("Note content changed since it was loaded")
        content_part = repos.content.replace_content_part(
            item_id=data.item_id,
            part_kind=data.part_kind,
            content_text=data.content_text,
            content_format=data.content_format,
            change_reason=data.change_reason,
            actor_principal_id=data.actor.principal_id,
        )
        record_write(
            repos=repos,
            item_id=data.item_id,
            actor_principal_id=data.actor.principal_id,
            operation_key="replace_content_part",
            target_table="content_parts",
            target_id=content_part.id,
            payload_summary=data.change_reason,
            target_object_type="content_part",
            target_object_id=content_part.id,
            target_field_key="content_text",
            provenance=data.provenance,
        )
        return to_content_part_data(content_part)
