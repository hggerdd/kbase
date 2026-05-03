from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import UpdateCategoryInput
from kbase.application.dto.common import CategoryData
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.application.services.mappers import to_category_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def _clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def update_category(
    data: UpdateCategoryInput,
    *,
    session_factory: sessionmaker | None = None,
) -> CategoryData:
    label = data.label.strip() if data.label is not None else None
    applies_to_kind = _clean_optional(data.applies_to_kind)
    parent_key = _clean_optional(data.parent_key)
    if label is not None and not label:
        raise ValueError("Category label is required")

    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        category = repos.items.get_category(data.key)
        if category is None:
            raise ValueError(f"Category '{data.key}' not found")
        next_applies_to_kind = applies_to_kind if data.applies_to_kind_provided else category.applies_to_kind
        next_parent_key = parent_key if data.parent_key_provided else category.parent_key
        if next_parent_key == category.key:
            raise ValueError("Category cannot be its own parent")
        if next_parent_key is not None:
            parent = repos.items.get_category(next_parent_key)
            if parent is None:
                raise ValueError(f"Parent category '{next_parent_key}' not found")
            if parent.full_path == category.full_path or parent.full_path.startswith(f"{category.full_path}/"):
                raise ValueError("Category cannot be moved below one of its descendants")
            if parent.applies_to_kind != next_applies_to_kind:
                raise ValueError("Child category must use the same applies_to_kind as its parent")
        descendants = repos.items.list_categories(full_path_prefix=category.full_path, include_inactive=True)
        if data.applies_to_kind_provided:
            child_categories = [entry for entry in descendants if entry.key != category.key]
            if child_categories:
                raise ValueError("Category applies_to_kind cannot be changed while it has child categories")
        updated = repos.items.update_category(
            category,
            label=label,
            description=data.description,
            description_provided=data.description_provided,
            applies_to_kind=applies_to_kind,
            applies_to_kind_provided=data.applies_to_kind_provided,
            parent_key=parent_key,
            parent_key_provided=data.parent_key_provided,
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
