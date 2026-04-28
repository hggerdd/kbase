from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from kbase.infrastructure.db import session as session_module
from kbase.infrastructure.db.bootstrap import initialize_database
from kbase.interfaces.api.main import app


def _init_db(path: Path) -> None:
    engine = create_engine(f"sqlite:///{path.as_posix()}", future=True)
    with engine.begin() as connection:
        initialize_database(connection)


def _client(
    monkeypatch,
    tmp_path,
    *,
    username: str = "heiko",
    password: str = "heiko-local-dev",
    login: bool = True,
    db_name: str = "api.sqlite",
) -> TestClient:
    db_path = tmp_path / db_name
    if not db_path.exists():
        _init_db(db_path)
    session_module._session_factory = None
    monkeypatch.setenv("KBASE_DB_URL", f"sqlite:///{db_path}")
    client = TestClient(app)
    if login:
        response = client.post("/api/auth/login", json={"username": username, "password": password})
        assert response.status_code == 200
    return client


def _bearer_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


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


def test_api_rejects_stale_note_content_replace(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    created = client.post(
        "/api/notes",
        json={
            "title": "Conflict note",
            "category_key": "research",
            "markdown_body": "Initial",
        },
        headers={"x-kbase-actor": "heiko"},
    )
    item_id = created.json()["item"]["id"]
    original_updated_at = created.json()["primary_content_part"]["updated_at"]

    first_save = client.put(
        f"/api/items/{item_id}/content",
        json={
            "content_text": "First save",
            "expected_content_updated_at": original_updated_at,
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert first_save.status_code == 200

    stale_save = client.put(
        f"/api/items/{item_id}/content",
        json={
            "content_text": "Stale overwrite",
            "expected_content_updated_at": original_updated_at,
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert stale_save.status_code == 409
    assert stale_save.json()["detail"] == "Note content changed since it was loaded"


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


def test_api_label_lifecycle(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    root = client.post(
        "/api/labels",
        json={"name": "finance"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert root.status_code == 200
    root_id = root.json()["id"]

    child = client.post(
        "/api/labels",
        json={"name": "investing", "parent_id": root_id},
        headers={"x-kbase-actor": "heiko"},
    )
    assert child.status_code == 200
    child_id = child.json()["id"]

    renamed = client.patch(
        f"/api/labels/{child_id}",
        json={"name": "assets"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert renamed.status_code == 200
    assert renamed.json()["full_path"] == "finance/assets"

    deactivated = client.post(
        f"/api/labels/{child_id}/deactivate",
        headers={"x-kbase-actor": "heiko"},
    )
    assert deactivated.status_code == 200
    assert deactivated.json()["is_active"] is False

    listed_active = client.get("/api/labels", headers={"x-kbase-actor": "heiko"})
    assert "finance/assets" not in [label["full_path"] for label in listed_active.json()]

    listed_all = client.get(
        "/api/labels",
        params={"include_inactive": "true"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert "finance/assets" in [label["full_path"] for label in listed_all.json()]

    reactivated = client.post(
        f"/api/labels/{child_id}/reactivate",
        headers={"x-kbase-actor": "heiko"},
    )
    assert reactivated.status_code == 200
    assert reactivated.json()["is_active"] is True


def test_api_category_lifecycle(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    created = client.post(
        "/api/categories",
        json={
            "key": "meeting_note",
            "label": "Meeting note",
            "description": "Notes captured from meetings",
            "applies_to_kind": "note",
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert created.status_code == 200
    assert created.json()["key"] == "meeting_note"

    listed = client.get(
        "/api/categories",
        params={"applies_to_kind": "note"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert listed.status_code == 200
    assert "meeting_note" in [category["key"] for category in listed.json()["categories"]]

    updated = client.patch(
        "/api/categories/meeting_note",
        json={"label": "Meeting notes", "is_active": False},
        headers={"x-kbase-actor": "heiko"},
    )
    assert updated.status_code == 200
    assert updated.json()["label"] == "Meeting notes"
    assert updated.json()["is_active"] is False

    active_only = client.get(
        "/api/categories",
        params={"applies_to_kind": "note"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert "meeting_note" not in [category["key"] for category in active_only.json()["categories"]]

    include_inactive = client.get(
        "/api/categories",
        params={"applies_to_kind": "note", "include_inactive": "true"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert "meeting_note" in [category["key"] for category in include_inactive.json()["categories"]]

    deleted = client.delete(
        "/api/categories/meeting_note",
        headers={"x-kbase-actor": "heiko"},
    )
    assert deleted.status_code == 200
    assert deleted.json() == {"key": "meeting_note", "deleted": True}


def test_api_rejects_delete_of_used_category(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    created = client.post(
        "/api/notes",
        json={
            "title": "Uses category",
            "category_key": "research",
            "markdown_body": "Body",
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert created.status_code == 200

    deleted = client.delete(
        "/api/categories/research",
        headers={"x-kbase-actor": "heiko"},
    )
    assert deleted.status_code == 400
    assert deleted.json()["detail"] == "Category 'research' is still in use and cannot be deleted"


def test_api_delete_label_removes_subtree_and_item_assignments(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    created = client.post(
        "/api/notes",
        json={
            "title": "Label delete",
            "category_key": "research",
            "markdown_body": "Body",
            "label_paths": ["finance/assets/etf", "finance/tax"],
        },
        headers={"x-kbase-actor": "heiko"},
    )
    item_id = created.json()["item"]["id"]

    labels = client.get(
        "/api/labels",
        params={"full_path_prefix": "finance/assets"},
        headers={"x-kbase-actor": "heiko"},
    )
    root_id = next(label["id"] for label in labels.json() if label["full_path"] == "finance/assets")

    deleted = client.delete(f"/api/labels/{root_id}", headers={"x-kbase-actor": "heiko"})

    assert deleted.status_code == 200
    assert deleted.json()["deleted_count"] == 2
    remaining = client.get(
        "/api/labels",
        params={"include_inactive": "true"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert "finance/assets" not in [label["full_path"] for label in remaining.json()]
    item = client.get(f"/api/items/{item_id}", headers={"x-kbase-actor": "heiko"})
    assert [label["full_path"] for label in item.json()["labels"]] == ["finance/tax"]


def test_api_search_supports_label_path_prefixes(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)

    created = client.post(
        "/api/notes",
        json={
            "title": "Depot export",
            "category_key": "research",
            "markdown_body": "CSV from broker",
            "label_paths": ["finance/bank/depot/data"],
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert created.status_code == 200

    other = client.post(
        "/api/notes",
        json={
            "title": "Income report",
            "category_key": "research",
            "markdown_body": "Payroll export",
            "label_paths": ["finance/income/data"],
        },
        headers={"x-kbase-actor": "heiko"},
    )
    assert other.status_code == 200

    search = client.get(
        "/api/search/content",
        params={"label_path_prefixes": "finance/bank"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert search.status_code == 200
    assert [item["title"] for item in search.json()["items"]] == ["Depot export"]

    exact = client.get(
        "/api/search/content",
        params={"label_paths": "finance/bank"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert exact.status_code == 200
    assert exact.json()["items"] == []

    exact_leaf = client.get(
        "/api/search/content",
        params={"label_paths": "finance/bank/depot/data"},
        headers={"x-kbase-actor": "heiko"},
    )
    assert exact_leaf.status_code == 200
    assert [item["title"] for item in exact_leaf.json()["items"]] == ["Depot export"]


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


def test_api_rejects_uploads_over_configured_size(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))
    monkeypatch.setenv("KBASE_MAX_UPLOAD_BYTES", "4")

    created = client.post(
        "/api/notes",
        json={
            "title": "Upload limit",
            "category_key": "research",
            "markdown_body": "Body",
        },
        headers={"x-kbase-actor": "heiko"},
    )
    item_id = created.json()["item"]["id"]

    attachment = client.post(
        f"/api/items/{item_id}/attachments/upload",
        files={"file": ("large.txt", b"12345", "text/plain")},
        headers={"x-kbase-actor": "heiko"},
    )
    assert attachment.status_code == 413
    assert "4 byte limit" in attachment.json()["detail"]

    file_item = client.post(
        "/api/file-items/upload",
        files={"file": ("large.txt", b"12345", "text/plain")},
        headers={"x-kbase-actor": "heiko"},
    )
    assert file_item.status_code == 413
    assert "4 byte limit" in file_item.json()["detail"]


def test_api_neutralizes_browser_executable_upload_mime_types(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    uploaded = client.post(
        "/api/file-items/upload",
        files={"file": ("payload.html", b"<script>alert(1)</script>", "text/html")},
        headers={"x-kbase-actor": "heiko"},
    )
    assert uploaded.status_code == 200
    payload = uploaded.json()
    item_id = payload["item"]["id"]
    file_payload = payload["files"][0]
    assert file_payload["mime_type"] == "application/octet-stream"

    download = client.get(
        f"/api/items/{item_id}/files/{file_payload['id']}/content",
        headers={"x-kbase-actor": "heiko"},
    )
    assert download.status_code == 200
    assert download.headers["content-type"].startswith("application/octet-stream")


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


def test_api_rejects_anonymous_domain_access(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path, login=False)

    response = client.get("/api/items")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_api_bearer_token_auth_can_access_domain_endpoints(monkeypatch, tmp_path) -> None:
    client = _client(monkeypatch, tmp_path)
    token_response = client.post("/api/auth/tokens", json={"token_label": "api-contract"})
    assert token_response.status_code == 200
    token = token_response.json()["secret"]

    bearer_client = _client(monkeypatch, tmp_path, login=False)
    created = bearer_client.post(
        "/api/notes",
        json={
            "title": "Bearer note",
            "category_key": "research",
            "markdown_body": "Token-authenticated note",
        },
        headers=_bearer_headers(token),
    )
    assert created.status_code == 200
    item_id = created.json()["item"]["id"]

    fetched = bearer_client.get(f"/api/items/{item_id}", headers=_bearer_headers(token))
    assert fetched.status_code == 200
    assert fetched.json()["item"]["title"] == "Bearer note"


def test_api_enforces_acl_for_reads_writes_projects_and_files(monkeypatch, tmp_path) -> None:
    heiko = _client(monkeypatch, tmp_path, db_name="shared-auth.sqlite")
    wife = _client(
        monkeypatch,
        tmp_path,
        username="wife",
        password="wife-local-dev",
        db_name="shared-auth.sqlite",
    )
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    project = heiko.post("/api/projects", json={"title": "Private Project"})
    assert project.status_code == 200
    project_id = project.json()["id"]

    created = heiko.post(
        "/api/notes",
        json={
            "title": "Private Note",
            "category_key": "research",
            "markdown_body": "Private body",
            "project_ids": [project_id],
        },
    )
    assert created.status_code == 200
    item_id = created.json()["item"]["id"]

    uploaded = heiko.post(
        f"/api/items/{item_id}/attachments/upload",
        files={"file": ("secret.txt", b"private attachment", "text/plain")},
    )
    assert uploaded.status_code == 200
    file_item = uploaded.json()["related_items"][0]
    file_detail = heiko.get(f"/api/items/{file_item['id']}")
    assert file_detail.status_code == 200
    file_id = file_detail.json()["files"][0]["id"]

    detail = wife.get(f"/api/items/{item_id}")
    assert detail.status_code == 403

    listed = wife.get("/api/items", params={"item_kind": "note"})
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()["items"]] == []

    search = wife.get("/api/search/content", params={"query": "Private"})
    assert search.status_code == 200
    assert search.json()["items"] == []

    edit = wife.put(
        f"/api/items/{item_id}/content",
        json={"content_text": "unauthorized overwrite"},
    )
    assert edit.status_code == 403

    relabel = wife.put(
        f"/api/items/{item_id}/labels",
        json={"label_paths": ["unauthorized/demo"]},
    )
    assert relabel.status_code == 403

    attachment = wife.post(
        f"/api/items/{item_id}/attachments/upload",
        files={"file": ("blocked.txt", b"blocked", "text/plain")},
    )
    assert attachment.status_code == 403

    download = wife.get(f"/api/items/{file_item['id']}/files/{file_id}/content")
    assert download.status_code == 403

    project_items = wife.get(f"/api/projects/{project_id}/items")
    assert project_items.status_code == 403


def test_api_item_detail_filters_inaccessible_related_items(monkeypatch, tmp_path) -> None:
    heiko = _client(monkeypatch, tmp_path, db_name="shared-related.sqlite")
    wife = _client(
        monkeypatch,
        tmp_path,
        username="wife",
        password="wife-local-dev",
        db_name="shared-related.sqlite",
    )
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    shared_note = heiko.post(
        "/api/notes",
        json={
            "title": "Shared shell",
            "category_key": "research",
            "markdown_body": "Visible to both",
        },
    )
    assert shared_note.status_code == 200
    item_id = shared_note.json()["item"]["id"]

    acl = heiko.put(
        f"/api/items/{item_id}/acl",
        json={
            "grants": [
                {"principal_id": "heiko", "permission_key": "view"},
                {"principal_id": "heiko", "permission_key": "edit"},
                {"principal_id": "heiko", "permission_key": "manage"},
                {"principal_id": "wife", "permission_key": "view"},
            ]
        },
    )
    assert acl.status_code == 200

    private_project = heiko.post("/api/projects", json={"title": "Hidden project"})
    assert private_project.status_code == 200
    project_id = private_project.json()["id"]

    update_shared = heiko.put(
        f"/api/items/{item_id}/content",
        json={"content_text": "Visible to both"},
    )
    assert update_shared.status_code == 200

    shared_with_project = heiko.post(
        "/api/notes",
        json={
            "title": "Shared shell 2",
            "category_key": "research",
            "markdown_body": "Visible to both",
            "project_ids": [project_id],
        },
    )
    assert shared_with_project.status_code == 200
    second_item_id = shared_with_project.json()["item"]["id"]

    acl_second = heiko.put(
        f"/api/items/{second_item_id}/acl",
        json={
            "grants": [
                {"principal_id": "heiko", "permission_key": "view"},
                {"principal_id": "heiko", "permission_key": "edit"},
                {"principal_id": "heiko", "permission_key": "manage"},
                {"principal_id": "wife", "permission_key": "view"},
            ]
        },
    )
    assert acl_second.status_code == 200

    uploaded = heiko.post(
        f"/api/items/{second_item_id}/attachments/upload",
        files={"file": ("hidden.txt", b"hidden related item", "text/plain")},
    )
    assert uploaded.status_code == 200

    wife_detail = wife.get(f"/api/items/{second_item_id}")
    assert wife_detail.status_code == 200
    payload = wife_detail.json()
    assert payload["related_items"] == []
    assert payload["outgoing_links"] == []
    assert payload["projects"] == []
