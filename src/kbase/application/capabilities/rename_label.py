from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import RenameLabelInput
from kbase.application.dto.common import LabelData
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.application.services.mappers import to_label_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def rename_label(
    data: RenameLabelInput,
    *,
    session_factory: sessionmaker | None = None,
) -> LabelData:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        label = repos.labels.rename_label(label_id=data.label_id, name=data.name)
        record_write(
            repos=repos,
            item_id=None,
            actor_principal_id=data.actor.principal_id,
            operation_key="rename_label",
            target_table="label_nodes",
            target_id=label.id,
            payload_summary=label.full_path,
            target_object_type="label",
            target_object_id=label.id,
            target_field_key="full_path",
            provenance=data.provenance,
        )
        return to_label_data(label)
