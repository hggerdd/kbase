from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import DeleteLabelInput, DeleteLabelResult
from kbase.application.services.capability_support import build_repositories, record_write
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def delete_label(
    data: DeleteLabelInput,
    *,
    session_factory: sessionmaker | None = None,
) -> DeleteLabelResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        deleted = repos.labels.delete_label_tree(label_id=data.label_id)
        deleted_ids = [label.id for label in deleted]
        deleted_paths = [label.full_path for label in deleted]
        record_write(
            repos=repos,
            item_id=None,
            actor_principal_id=data.actor.principal_id,
            operation_key="delete_label",
            target_table="label_nodes",
            target_id=data.label_id,
            payload_summary=", ".join(reversed(deleted_paths)),
            target_object_type="label",
            target_object_id=data.label_id,
            target_field_key=None,
            provenance=data.provenance,
        )
        return DeleteLabelResult(
            deleted_label_ids=deleted_ids,
            deleted_count=len(deleted_ids),
            deleted_paths=deleted_paths,
        )
