from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import CreateCategoryInput
from kbase.application.dto.common import CategoryData
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.application.services.mappers import to_category_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def create_category(
    data: CreateCategoryInput,
    *,
    session_factory: sessionmaker | None = None,
) -> CategoryData:
    key = data.key.strip()
    label = data.label.strip()
    if not key:
        raise ValueError("Category key is required")
    if not label:
        raise ValueError("Category label is required")

    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        if repos.items.get_category(key) is not None:
            raise ValueError(f"Category '{key}' already exists")
        category = repos.items.create_category(
            key=key,
            label=label,
            description=data.description,
            applies_to_kind=data.applies_to_kind,
        )
        record_write(
            repos=repos,
            item_id=None,
            actor_principal_id=data.actor.principal_id,
            operation_key="create_category",
            target_table="item_categories",
            target_id=category.key,
            payload_summary=category.label,
            target_object_type="category",
            target_object_id=category.key,
            target_field_key=None,
            provenance=data.provenance,
        )
        return to_category_data(category)
