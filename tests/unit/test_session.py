from __future__ import annotations

from pathlib import Path

from kbase.infrastructure.db.session import _default_db_url


def test_default_db_url_points_to_repo_kb_db(monkeypatch) -> None:
    monkeypatch.delenv("KBASE_DB_URL", raising=False)
    expected = (Path(__file__).resolve().parents[2] / "kb" / "db" / "kbase.sqlite").as_posix()
    assert _default_db_url() == f"sqlite:///{expected}"
