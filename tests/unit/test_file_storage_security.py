from __future__ import annotations

import pytest

from kbase.infrastructure.files.inbox_store import InboxStore
from kbase.infrastructure.files.item_file_store import ItemFileStore


def test_item_file_store_rejects_write_outside_storage_root(tmp_path) -> None:
    store = ItemFileStore(root=tmp_path / "items")

    with pytest.raises(ValueError, match="storage root"):
        store.write_bytes(relative_path="../outside.txt", payload=b"escape")

    assert not (tmp_path / "outside.txt").exists()


def test_item_file_store_resolves_valid_relative_path(tmp_path) -> None:
    store = ItemFileStore(root=tmp_path / "items")

    target = store.write_bytes(relative_path="documents/ab/demo.txt", payload=b"ok")

    assert target == (tmp_path / "items" / "documents" / "ab" / "demo.txt").resolve()
    assert target.read_bytes() == b"ok"


def test_inbox_store_rejects_raw_path_traversal(tmp_path) -> None:
    store = InboxStore(root=tmp_path / "inbox")
    outside = tmp_path / "secret.txt"
    outside.write_text("no", encoding="utf-8")

    with pytest.raises(ValueError, match="kb/inbox/raw"):
        store.resolve_raw_path("../../secret.txt")


def test_inbox_store_rejects_processing_destination_traversal(tmp_path) -> None:
    store = InboxStore(root=tmp_path / "inbox")
    store.raw_root.mkdir(parents=True)
    (store.raw_root / "sample.txt").write_text("content", encoding="utf-8")

    with pytest.raises(ValueError, match="Processing path"):
        store.move_raw_to_processing("../raw/sample.txt")


def test_inbox_store_rejects_processing_cleanup_traversal(tmp_path) -> None:
    store = InboxStore(root=tmp_path / "inbox")

    with pytest.raises(ValueError, match="Processing path"):
        store.remove_processing_file("../raw/sample.txt")
