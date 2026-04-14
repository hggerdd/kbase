from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from kbase.infrastructure.db.repositories.asset_repository import AssetRepository
from kbase.infrastructure.db.repositories.audit_repository import AuditRepository
from kbase.infrastructure.db.repositories.content_repository import ContentRepository
from kbase.infrastructure.db.repositories.item_file_repository import ItemFileRepository
from kbase.infrastructure.db.repositories.item_repository import ItemRepository
from kbase.infrastructure.db.repositories.label_repository import LabelRepository
from kbase.infrastructure.db.repositories.link_repository import LinkRepository
from kbase.infrastructure.db.repositories.metadata_repository import MetadataRepository
from kbase.infrastructure.db.repositories.project_repository import ProjectRepository
from kbase.infrastructure.db.repositories.provenance_repository import ProvenanceRepository
from kbase.infrastructure.db.repositories.search_repository import SearchRepository


@dataclass(slots=True)
class RepositoryBundle:
    items: ItemRepository
    item_files: ItemFileRepository
    content: ContentRepository
    metadata: MetadataRepository
    labels: LabelRepository
    links: LinkRepository
    assets: AssetRepository
    projects: ProjectRepository
    audit: AuditRepository
    provenance: ProvenanceRepository
    search: SearchRepository


def build_repositories(session: Session) -> RepositoryBundle:
    return RepositoryBundle(
        items=ItemRepository(session),
        item_files=ItemFileRepository(session),
        content=ContentRepository(session),
        metadata=MetadataRepository(session),
        labels=LabelRepository(session),
        links=LinkRepository(session),
        assets=AssetRepository(session),
        projects=ProjectRepository(session),
        audit=AuditRepository(session),
        provenance=ProvenanceRepository(session),
        search=SearchRepository(session),
    )


def require_item(repo: ItemRepository, item_id: str):
    item = repo.get(item_id)
    if item is None:
        raise ValueError(f"Item '{item_id}' not found")
    return item


def record_write(
    *,
    repos: RepositoryBundle,
    item_id: str | None,
    actor_principal_id: str,
    operation_key: str,
    target_table: str,
    target_id: str,
    payload_summary: str | None,
    target_object_type: str,
    target_object_id: str,
    target_field_key: str | None,
    provenance,
):
    audit_event = repos.audit.record_event(
        item_id=item_id,
        actor_principal_id=actor_principal_id,
        operation_key=operation_key,
        target_table=target_table,
        target_id=target_id,
        payload_summary=payload_summary,
    )
    repos.provenance.record(
        target_object_type=target_object_type,
        target_object_id=target_object_id,
        target_field_key=target_field_key,
        source_object_type=provenance.source_object_type,
        source_object_id=provenance.source_object_id,
        source_uri=provenance.source_uri,
        method_key=provenance.method_key,
        data_class=provenance.data_class,
        confidence=None,
        created_by_principal_id=actor_principal_id,
    )
    return audit_event
