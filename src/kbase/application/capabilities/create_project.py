from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import CreateProjectInput
from kbase.application.dto.common import ItemSummary
from kbase.application.services.capability_support import build_repositories, ensure_owner_acl, record_write
from kbase.application.services.mappers import to_item_summary
from kbase.core.policies.classification_policy import category_applies_to_item_kind
from kbase.core.policies.metadata_policy import build_typed_metadata_payload
from kbase.core.rules.modelling_rules import PROJECT_ITEM_KIND
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def create_project(
    data: CreateProjectInput,
    *,
    session_factory: sessionmaker | None = None,
) -> ItemSummary:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        category = repos.items.get_category(data.category_key)
        if category is None:
            raise ValueError(f"Unknown category '{data.category_key}'")
        if not category_applies_to_item_kind(category.applies_to_kind, PROJECT_ITEM_KIND):
            raise ValueError(f"Category '{data.category_key}' is not valid for project items")
        project = repos.items.create(
            title=data.title,
            item_kind=PROJECT_ITEM_KIND,
            category_key=data.category_key,
            status=data.status,
            origin="manual",
            language_code=None,
            created_by_principal_id=data.actor.principal_id,
        )
        ensure_owner_acl(repos, item_id=project.id, actor_principal_id=data.actor.principal_id)
        if data.description:
            field = repos.metadata.get_field_definition("description")
            assert field is not None
            typed = build_typed_metadata_payload(field.value_type, data.description)
            repos.metadata.upsert_field(
                item_id=project.id,
                field_key="description",
                values=typed,
                source="manual",
                confidence=None,
                created_by_principal_id=data.actor.principal_id,
            )
        record_write(
            repos=repos,
            item_id=project.id,
            actor_principal_id=data.actor.principal_id,
            operation_key="create_project",
            target_table="items",
            target_id=project.id,
            payload_summary=data.title,
            target_object_type="item",
            target_object_id=project.id,
            target_field_key=None,
            provenance=data.provenance,
        )
        return to_item_summary(project)
