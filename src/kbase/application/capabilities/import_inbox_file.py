from __future__ import annotations

from pathlib import Path

from kbase.application.capabilities.import_file_as_item import import_file_as_item
from kbase.application.dto.capabilities import CreateFileItemInput, ImportInboxFileInput, ItemDetailResult
from kbase.infrastructure.files.inbox_store import InboxStore


def _infer_file_item_kind(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"}:
        return "image"
    if suffix in {".xls", ".xlsx", ".csv", ".ods"}:
        return "spreadsheet"
    return "document"


def import_inbox_file(
    data: ImportInboxFileInput,
    *,
    store: InboxStore | None = None,
) -> ItemDetailResult:
    inbox_store = store or InboxStore()
    processing_path, processing_relative_path = inbox_store.move_raw_to_processing(data.inbox_relative_path)
    try:
        payload = processing_path.read_bytes()
        result = import_file_as_item(
            CreateFileItemInput(
                title=data.title,
                item_kind=data.item_kind or _infer_file_item_kind(processing_path),
                category_key=data.category_key,
                status=data.status,
                language_code=data.language_code,
                original_filename=processing_path.name,
                size_bytes=len(payload),
                file_bytes=payload,
                link_to_item_id=data.link_to_item_id,
                link_type=data.link_type,
                link_note=data.link_note,
                project_ids=data.project_ids,
                label_paths=data.label_paths,
                metadata=data.metadata,
                actor=data.actor,
                provenance=data.provenance,
            )
        )
    except Exception:
        inbox_store.move_processing_to_rejected(processing_relative_path)
        raise

    inbox_store.remove_processing_file(processing_relative_path)
    return result
