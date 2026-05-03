from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import CreateCategoryInput
from kbase.application.dto.common import CategoryData
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.application.services.mappers import to_category_data
from kbase.core.policies.classification_policy import category_can_be_child_of_parent
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def _clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def create_category(
    data: CreateCategoryInput,
    *,
    session_factory: sessionmaker | None = None,
) -> CategoryData:
    key = data.key.strip()
    label = data.label.strip()
    applies_to_kind = _clean_optional(data.applies_to_kind)
    parent_key = _clean_optional(data.parent_key)
    if not key:
        raise ValueError("Category key is required")
    if not label:
        raise ValueError("Category label is required")

    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        if repos.items.get_category(key) is not None:
            raise ValueError(f"Category '{key}' already exists")
        if parent_key is not None:
            parent = repos.items.get_category(parent_key)
            if parent is None:
                raise ValueError(f"Parent category '{parent_key}' not found")
            if not category_can_be_child_of_parent(
                child_applies_to_kind=applies_to_kind,
                parent_applies_to_kind=parent.applies_to_kind,
            ):
                raise ValueError("Child category must be compatible with its parent applies_to_kind")
        category = repos.items.create_category(
            key=key,
            label=label,
            description=data.description,
            applies_to_kind=applies_to_kind,
            parent_key=parent_key,
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
