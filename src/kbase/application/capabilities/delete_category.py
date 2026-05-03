from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import DeleteCategoryInput, DeleteCategoryResult
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def delete_category(
    data: DeleteCategoryInput,
    *,
    session_factory: sessionmaker | None = None,
) -> DeleteCategoryResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        category = repos.items.get_category(data.key)
        if category is None:
            raise ValueError(f"Category '{data.key}' not found")

        child_categories = [
            entry
            for entry in repos.items.list_categories(full_path_prefix=category.full_path, include_inactive=True)
            if entry.key != data.key
        ]
        if child_categories:
            raise ValueError(f"Category '{data.key}' has child categories and cannot be deleted")

        item_count = repos.items.count_items_with_category(data.key)
        classification_count = repos.items.count_classifications_with_category(data.key)
        if item_count > 0 or classification_count > 0:
            raise ValueError(f"Category '{data.key}' is still in use and cannot be deleted")

        repos.items.delete_category(category)
        record_write(
            repos=repos,
            item_id=None,
            actor_principal_id=data.actor.principal_id,
            operation_key="delete_category",
            target_table="item_categories",
            target_id=data.key,
            payload_summary=data.key,
            target_object_type="category",
            target_object_id=data.key,
            target_field_key=None,
            provenance=data.provenance,
        )
        return DeleteCategoryResult(key=data.key, deleted=True)
