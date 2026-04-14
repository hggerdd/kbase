from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import AssignLabelsInput
from kbase.application.dto.common import LabelData
from kbase.application.services.capability_support import build_repositories, record_write, require_item
from kbase.application.services.mappers import to_label_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def replace_labels(
    data: AssignLabelsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> list[LabelData]:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.item_id)
        labels = repos.labels.replace_labels(
            item_id=data.item_id,
            label_paths=data.label_paths,
            created_by_principal_id=data.actor.principal_id,
        )
        record_write(
            repos=repos,
            item_id=data.item_id,
            actor_principal_id=data.actor.principal_id,
            operation_key="replace_labels",
            target_table="item_labels",
            target_id=data.item_id,
            payload_summary=", ".join(sorted(set(data.label_paths))),
            target_object_type="item",
            target_object_id=data.item_id,
            target_field_key="labels",
            provenance=data.provenance,
        )
        return [to_label_data(label) for label in labels]
