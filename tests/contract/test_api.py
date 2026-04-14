from __future__ import annotations

import sqlite3
from pathlib import Path

from fastapi.testclient import TestClient

from kbase.infrastructure.db import session as session_module
from kbase.interfaces.api.main import app


ROOT = Path(__file__).resolve().parents[2]


def _read_sql(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _init_db(path: Path) -> None:
    schema_path = ROOT / "src" / "kbase" / "infrastructure" / "db" / "sql" / "001_schema.sql"
    seed_path = ROOT / "src" / "kbase" / "infrastructure" / "db" / "sql" / "002_seed_reference_data.sql"
    with sqlite3.connect(path) as connection:
        connection.executescript(_read_sql(schema_path))
        connection.executescript(_read_sql(seed_path))
        connection.commit()


def _client(monkeypatch, tmp_path) -> TestClient:
    db_path = tmp_path / "api.sqlite"
    _init_db(db_path)
    session_module._session_factory = None
    monkeypatch.setenv("KBASE_DB_URL", f"sqlite:///{db_path}")
    return TestClient(app)


def test_api_health(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_api_create_note_and_get_item(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    created = client.post(
        "/api/notes",
        json={
            "title": "API Note",
            "category_key": "research",
            "markdown_body": "Body from API",
            "label_paths": ["api/demo"],
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert created.status_code == 200
    note = created.json()

    fetched = client.get(f"/api/items/{note['item']['id']}", headers={"x-kbase-actor": "heiko"})
    assert fetched.status_code == 200
    item = fetched.json()
    assert item["item"]["title"] == "API Note"
    assert item["labels"][0]["full_path"] == "api/demo"


def test_api_project_flow_and_search(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    project = client.post(
        "/api/projects",
        json={"title": "API Project", "description": "Project context"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert project.status_code == 200
    project_id = project.json()["id"]

    note = client.post(
        "/api/notes",
        json={
            "title": "Waschmaschine",
            "category_key": "research",
            "markdown_body": "Bosch vs Siemens",
            "project_ids": [project_id],
            "label_paths": ["household/appliances"],
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert note.status_code == 200

    project_items = client.get(
        f"/api/projects/{project_id}/items",
        headers={"x-kbase-actor": "heiko"},
    )
    assert project_items.status_code == 200
    assert [item["title"] for item in project_items.json()["items"]] == ["Waschmaschine"]

    search = client.get(
        "/api/search/content",
        params={"query": "Bosch", "project_id": project_id, "label_paths": "household/appliances"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert search.status_code == 200
    assert [item["title"] for item in search.json()["items"]] == ["Waschmaschine"]


def test_api_invalid_category_returns_400(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    response = client.post(
        "/api/notes",
        json={
            "title": "Bad note",
            "category_key": "project_general",
            "markdown_body": "invalid",
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert response.status_code == 400
    assert "not valid for notes" in response.json()["detail"]


def test_api_can_list_and_replace_labels(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    created = client.post(
        "/api/notes",
        json={
            "title": "Label note",
            "category_key": "research",
            "markdown_body": "Body",
            "label_paths": ["alpha/one", "beta/two"],
        },
        headers={"x-kbase-actor": "heiko"},
    )
    item_id = created.json()["item"]["id"]

    labels = client.get("/api/labels", headers={"x-kbase-actor": "heiko"})
    assert labels.status_code == 200
    assert "alpha/one" in [label["full_path"] for label in labels.json()]

    replaced = client.put(
        f"/api/items/{item_id}/labels",
        json={"label_paths": ["beta/two", "gamma/three"]},
        headers={"x-kbase-actor": "heiko"},
    )
    assert replaced.status_code == 200
    assert [label["full_path"] for label in replaced.json()] == ["beta/two", "gamma/three"]

    item = client.get(f"/api/items/{item_id}", headers={"x-kbase-actor": "heiko"})
    assert [label["full_path"] for label in item.json()["labels"]] == ["beta/two", "gamma/three"]


def test_api_can_upload_attachment_and_link_to_note(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    created = client.post(
        "/api/notes",
        json={
            "title": "Attachment note",
            "category_key": "research",
            "markdown_body": "Body",
        },
        headers={"x-kbase-actor": "heiko"},
    )
    item_id = created.json()["item"]["id"]

    uploaded = client.post(
        f"/api/items/{item_id}/attachments/upload",
        files={"file": ("demo.txt", b"hello attachment", "text/plain")},
        headers={"x-kbase-actor": "heiko"},
    )
    assert uploaded.status_code == 200
    note_payload = uploaded.json()
    assert len(note_payload["related_items"]) == 1
    file_item_id = note_payload["related_items"][0]["id"]

    file_item = client.get(f"/api/items/{file_item_id}", headers={"x-kbase-actor": "heiko"})
    assert file_item.status_code == 200
    file_payload = file_item.json()
    assert file_payload["item"]["item_kind"] == "document"
    assert len(file_payload["files"]) == 1
    assert file_payload["files"][0]["original_filename"] == "demo.txt"

    download = client.get(
        f"/api/items/{file_item_id}/files/{file_payload['files'][0]['id']}/content",
        headers={"x-kbase-actor": "heiko"},
    )
    assert download.status_code == 200
    assert download.content == b"hello attachment"


def test_api_can_list_and_import_inbox_file(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    inbox_root = tmp_path / "inbox"
    raw_root = inbox_root / "raw"
    raw_root.mkdir(parents=True)
    (raw_root / "scan.txt").write_text("from inbox", encoding="utf-8")
    monkeypatch.setenv("KBASE_INBOX_ROOT", str(inbox_root))
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    listed = client.get("/api/inbox/files")
    assert listed.status_code == 200
    assert listed.json()["files"][0]["relative_path"] == "scan.txt"

    imported = client.post(
        "/api/inbox/import",
        json={"inbox_relative_path": "scan.txt"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert imported.status_code == 200
    payload = imported.json()
    assert payload["item"]["item_kind"] == "document"
    assert payload["files"][0]["original_filename"] == "scan.txt"

    listed_after = client.get("/api/inbox/files")
    assert listed_after.status_code == 200
    assert listed_after.json()["files"] == []


def test_api_can_upload_file_item_into_project(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    project = client.post(
        "/api/projects",
        json={"title": "Upload Project"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert project.status_code == 200
    project_id = project.json()["id"]

    uploaded = client.post(
        "/api/file-items/upload",
        data={"project_ids": project_id},
        files={"file": ("scan.txt", b"project upload", "text/plain")},
        headers={"x-kbase-actor": "heiko"},
    )
    assert uploaded.status_code == 200
    payload = uploaded.json()
    assert [entry["id"] for entry in payload["projects"]] == [project_id]

    project_items = client.get(
        f"/api/projects/{project_id}/items",
        headers={"x-kbase-actor": "heiko"},
    )
    assert project_items.status_code == 200
    assert [item["title"] for item in project_items.json()["items"]] == ["scan.txt"]
