from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from typer.testing import CliRunner

from kbase.infrastructure.db import session as session_module
from kbase.interfaces.cli.main import app


RUNNER = CliRunner()
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


def _configure_cli_db(monkeypatch, tmp_path: Path) -> Path:
    db_path = tmp_path / "cli.sqlite"
    _init_db(db_path)
    session_module._session_factory = None
    monkeypatch.setenv("KBASE_DB_URL", f"sqlite:///{db_path}")
    return db_path


def test_cli_note_create_and_item_get_json(monkeypatch, tmp_path) -> None:
    _configure_cli_db(monkeypatch, tmp_path)

    create_result = RUNNER.invoke(
        app,
        [
            "note",
            "create",
            "--title",
            "CLI Note",
            "--category",
            "research",
            "--body",
            "Body from CLI",
            "--json",
        ],
    )
    assert create_result.exit_code == 0
    created = json.loads(create_result.stdout)

    get_result = RUNNER.invoke(app, ["item", "get", created["item"]["id"], "--json"])
    assert get_result.exit_code == 0
    item = json.loads(get_result.stdout)
    assert item["item"]["title"] == "CLI Note"
    assert item["primary_content_part"]["content_text"] == "Body from CLI"


def test_cli_workflow_notes_core_creates_project_and_note(monkeypatch, tmp_path) -> None:
    _configure_cli_db(monkeypatch, tmp_path)

    result = RUNNER.invoke(
        app,
        [
            "workflow",
            "notes-core",
            "--project-title",
            "CLI Workflow",
            "--title",
            "Workflow note",
            "--category",
            "research",
            "--body",
            "Workflow body",
            "--label",
            "demo/cli",
            "--json",
        ],
    )
    assert result.exit_code == 0
    payload = json.loads(result.stdout)
    assert payload["workflow"] == "notes_core"
    assert payload["project"]["title"] == "CLI Workflow"
    assert payload["note"]["item"]["title"] == "Workflow note"


def test_cli_content_replace_accepts_stdin(monkeypatch, tmp_path) -> None:
    _configure_cli_db(monkeypatch, tmp_path)

    created = RUNNER.invoke(
        app,
        [
            "note",
            "create",
            "--title",
            "STDIN note",
            "--category",
            "research",
            "--body",
            "old",
            "--json",
        ],
    )
    note = json.loads(created.stdout)

    replace_result = RUNNER.invoke(
        app,
        ["content", "replace", note["item"]["id"], "--stdin", "--json"],
        input="new body from stdin",
    )
    assert replace_result.exit_code == 0

    get_result = RUNNER.invoke(app, ["item", "get", note["item"]["id"], "--json"])
    item = json.loads(get_result.stdout)
    assert item["primary_content_part"]["content_text"] == "new body from stdin"


def test_cli_file_item_import_links_file_to_note(monkeypatch, tmp_path) -> None:
    _configure_cli_db(monkeypatch, tmp_path)
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    created = RUNNER.invoke(
        app,
        [
            "note",
            "create",
            "--title",
            "Attachment target",
            "--category",
            "research",
            "--body",
            "Body",
            "--json",
        ],
    )
    note = json.loads(created.stdout)
    source_file = tmp_path / "offer.txt"
    source_file.write_text("hello file item", encoding="utf-8")

    imported = RUNNER.invoke(
        app,
        [
            "file-item",
            "import",
            "--path",
            str(source_file),
            "--link-to-item-id",
            note["item"]["id"],
            "--json",
        ],
    )
    assert imported.exit_code == 0
    file_item = json.loads(imported.stdout)
    assert file_item["item"]["item_kind"] == "document"
    assert file_item["files"][0]["original_filename"] == "offer.txt"

    fetched = RUNNER.invoke(app, ["item", "get", note["item"]["id"], "--json"])
    note_payload = json.loads(fetched.stdout)
    assert len(note_payload["related_items"]) == 1


def test_cli_inbox_list_and_import(monkeypatch, tmp_path) -> None:
    _configure_cli_db(monkeypatch, tmp_path)
    inbox_root = tmp_path / "inbox"
    raw_root = inbox_root / "raw"
    raw_root.mkdir(parents=True)
    (raw_root / "incoming.txt").write_text("hello inbox", encoding="utf-8")
    monkeypatch.setenv("KBASE_INBOX_ROOT", str(inbox_root))
    monkeypatch.setenv("KBASE_STORAGE_ROOT", str(tmp_path / "items"))

    listed = RUNNER.invoke(app, ["inbox", "list", "--json"])
    assert listed.exit_code == 0
    listed_payload = json.loads(listed.stdout)
    assert listed_payload["files"][0]["relative_path"] == "incoming.txt"

    imported = RUNNER.invoke(app, ["inbox", "import", "--path", "incoming.txt", "--json"])
    assert imported.exit_code == 0
    imported_payload = json.loads(imported.stdout)
    assert imported_payload["item"]["item_kind"] == "document"
    assert imported_payload["files"][0]["original_filename"] == "incoming.txt"


def test_cli_label_lifecycle(monkeypatch, tmp_path) -> None:
    _configure_cli_db(monkeypatch, tmp_path)

    created = RUNNER.invoke(
        app,
        ["label", "create", "--name", "finance", "--json"],
    )
    assert created.exit_code == 0
    root = json.loads(created.stdout)

    child_created = RUNNER.invoke(
        app,
        ["label", "create", "--name", "investing", "--parent-id", root["id"], "--json"],
    )
    assert child_created.exit_code == 0
    child = json.loads(child_created.stdout)

    renamed = RUNNER.invoke(
        app,
        ["label", "rename", child["id"], "--name", "assets", "--json"],
    )
    assert renamed.exit_code == 0
    renamed_payload = json.loads(renamed.stdout)
    assert renamed_payload["full_path"] == "finance/assets"

    deactivated = RUNNER.invoke(
        app,
        ["label", "deactivate", child["id"], "--json"],
    )
    assert deactivated.exit_code == 0
    assert json.loads(deactivated.stdout)["is_active"] is False

    listed = RUNNER.invoke(app, ["label", "list"])
    assert listed.exit_code == 0
    assert "finance/assets" not in listed.stdout
