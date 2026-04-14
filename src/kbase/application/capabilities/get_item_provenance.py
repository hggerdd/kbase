from __future__ import annotations

from sqlalchemy.orm import sessionmaker

from kbase.application.dto.capabilities import GetItemInput, GetItemProvenanceResult
from kbase.application.services.capability_support import build_repositories, require_item
from kbase.application.services.mappers import to_provenance_record_data
from kbase.infrastructure.db.session import get_session_factory
from kbase.infrastructure.db.unit_of_work import SqlAlchemyUnitOfWork


def get_item_provenance(
    data: GetItemInput,
    *,
    session_factory: sessionmaker | None = None,
) -> GetItemProvenanceResult:
    with SqlAlchemyUnitOfWork(session_factory or get_session_factory()) as uow:
        assert uow.session is not None
        repos = build_repositories(uow.session)
        require_item(repos.items, data.item_id)
        records = repos.provenance.get_item_provenance(data.item_id)
        return GetItemProvenanceResult(
            item_id=data.item_id,
            records=[to_provenance_record_data(record) for record in records],
        )

