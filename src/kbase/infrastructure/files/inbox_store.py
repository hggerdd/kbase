from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import os
import shutil
from pathlib import Path


def _workspace_root() -> Path:
    return Path(__file__).resolve().parents[4]


def _inbox_root() -> Path:
    env_root = os.getenv("KBASE_INBOX_ROOT")
    if env_root:
        return Path(env_root)
    return _workspace_root() / "kb" / "inbox"


@dataclass(slots=True)
class InboxFileEntry:
    relative_path: str
    filename: str
    size_bytes: int
    modified_at: str


class InboxStore:
    def __init__(self, root: Path | None = None) -> None:
        self.root = root or _inbox_root()
        self.raw_root = self.root / "raw"
        self.processing_root = self.root / "processing"
        self.rejected_root = self.root / "rejected"

    def list_raw_files(self) -> list[InboxFileEntry]:
        if not self.raw_root.exists():
            return []
        entries: list[InboxFileEntry] = []
        for path in sorted((entry for entry in self.raw_root.rglob("*") if entry.is_file()), key=lambda item: item.as_posix()):
            stat = path.stat()
            entries.append(
                InboxFileEntry(
                    relative_path=path.relative_to(self.raw_root).as_posix(),
                    filename=path.name,
                    size_bytes=stat.st_size,
                    modified_at=datetime.fromtimestamp(stat.st_mtime, UTC).isoformat(),
                )
            )
        return entries

    def resolve_raw_path(self, relative_path: str) -> Path:
        candidate = (self.raw_root / relative_path).resolve()
        raw_root = self.raw_root.resolve()
        if raw_root not in candidate.parents and candidate != raw_root:
            raise ValueError("Inbox path must stay within kb/inbox/raw")
        if not candidate.exists() or not candidate.is_file():
            raise ValueError(f"Inbox file '{relative_path}' not found")
        return candidate

    def move_raw_to_processing(self, relative_path: str) -> tuple[Path, str]:
        source = self.resolve_raw_path(relative_path)
        destination_relative = self._build_unique_relative_path(relative_path, self.processing_root)
        destination = self.processing_root / destination_relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source), str(destination))
        return destination, destination_relative.as_posix()

    def move_processing_to_rejected(self, processing_relative_path: str) -> Path:
        source = (self.processing_root / processing_relative_path).resolve()
        processing_root = self.processing_root.resolve()
        if processing_root not in source.parents and source != processing_root:
            raise ValueError("Processing path must stay within kb/inbox/processing")
        if not source.exists():
            raise ValueError(f"Processing file '{processing_relative_path}' not found")
        destination_relative = self._build_unique_relative_path(processing_relative_path, self.rejected_root)
        destination = self.rejected_root / destination_relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source), str(destination))
        return destination

    def remove_processing_file(self, processing_relative_path: str) -> None:
        source = (self.processing_root / processing_relative_path).resolve()
        processing_root = self.processing_root.resolve()
        if processing_root not in source.parents and source != processing_root:
            raise ValueError("Processing path must stay within kb/inbox/processing")
        if source.exists():
            source.unlink()

    def _build_unique_relative_path(self, relative_path: str, target_root: Path) -> Path:
        target = Path(relative_path)
        candidate = target
        counter = 1
        while (target_root / candidate).exists():
            candidate = target.with_name(f"{target.stem}_{counter}{target.suffix}")
            counter += 1
        return candidate
