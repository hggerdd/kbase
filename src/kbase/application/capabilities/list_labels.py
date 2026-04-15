from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import ListLabelsInput
from kbase.application.dto.common import LabelData
from kbase.application.services.capability_support import build_repositories
from kbase.application.services.mappers import to_label_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def list_labels(
    data: ListLabelsInput,
    *,
    session_factory: sessionmaker | None = None,
) -> list[LabelData]:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        labels = repos.labels.list_labels(
            query=data.query,
            limit=data.limit,
            include_inactive=data.include_inactive,
            parent_id=data.parent_id,
            full_path_prefix=data.full_path_prefix,
        )
        return [to_label_data(label) for label in labels]
