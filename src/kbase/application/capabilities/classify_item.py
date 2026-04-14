from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ClassifyItemInput
from kbase.application.dto.common import ItemSummary
from kbase.application.services.capability_support import build_repositories, record_write, require_item
from kbase.application.services.mappers import to_item_summary
from kbase.core.policies.classification_policy import (
    ensure_secondary_categories_do_not_repeat_primary,
    validate_primary_category,
)
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def classify_item(
    data: ClassifyItemInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemSummary:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        item = require_item(repos.items, data.item_id)
        category = repos.items.get_category(data.primary_category_key)
        if category is None:
            raise ValueError(f"Unknown category '{data.primary_category_key}'")
        if category.applies_to_kind and category.applies_to_kind != item.item_kind:
            raise ValueError(
                f"Category '{data.primary_category_key}' is not valid for item_kind '{item.item_kind}'"
            )
        validate_primary_category(item.item_kind, data.primary_category_key)
        secondaries = ensure_secondary_categories_do_not_repeat_primary(
            data.primary_category_key, data.secondary_category_keys
        )
        repos.items.update_core(
            item,
            title=None,
            category_key=data.primary_category_key,
            status=None,
            language_code=None,
            is_archived=None,
        )
        repos.items.set_classifications(
            item_id=item.id,
            secondary_category_keys=secondaries,
            created_by_principal_id=data.actor.principal_id,
        )
        record_write(
            repos=repos,
            item_id=item.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="classify_item",
            target_table="items",
            target_id=item.id,
            payload_summary=data.primary_category_key,
            target_object_type="item",
            target_object_id=item.id,
            target_field_key="category_key",
            provenance=data.provenance,
        )
        return to_item_summary(item)

