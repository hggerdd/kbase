from __future__ import annotations

from kbase.application.dto.capabilities import ListInboxFilesResult
from kbase.application.services.mappers import to_inbox_file_data
from kbase.infrastructure.files.inbox_store import InboxStore


def list_inbox_files(*, store: InboxStore | None = None) -> ListInboxFilesResult:
    inbox_store = store or InboxStore()
    return ListInboxFilesResult(
        files=[
            to_inbox_file_data(
                relative_path=entry.relative_path,
                filename=entry.filename,
                size_bytes=entry.size_bytes,
                modified_at=entry.modified_at,
            )
            for entry in inbox_store.list_raw_files()
        ]
    )
