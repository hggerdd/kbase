from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import UpdateCategoryInput
from kbase.application.dto.common import CategoryData
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.application.services.mappers import to_category_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def update_category(
    data: UpdateCategoryInput,
    *,
    session_factory: sessionmaker | None = None,
) -> CategoryData:
    label = data.label.strip() if data.label is not None else None
    if label is not None and not label:
        raise ValueError("Category label is required")

    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        category = repos.items.get_category(data.key)
        if category is None:
            raise ValueError(f"Category '{data.key}' not found")
        updated = repos.items.update_category(
            category,
            label=label,
            description=data.description,
            description_provided=data.description_provided,
            applies_to_kind=data.applies_to_kind,
            applies_to_kind_provided=data.applies_to_kind_provided,
            is_active=data.is_active,
        )
        record_write(
            repos=repos,
            item_id=None,
            actor_principal_id=data.actor.principal_id,
            operation_key="update_category",
            target_table="item_categories",
            target_id=updated.key,
            payload_summary=updated.label,
            target_object_type="category",
            target_object_id=updated.key,
            target_field_key=None,
            provenance=data.provenance,
        )
        return to_category_data(updated)
