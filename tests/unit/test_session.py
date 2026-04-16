from __future__ import annotations

from kbase.infrastructure.db.session import _default_db_url


def test_default_db_url_points_to_local_postgres(monkeypatch) -> None:
    monkeypatch.delenv("KBASE_DB_URL", raising=False)
    assert _default_db_url() == "postgresql+psycopg://kbase:kbase@127.0.0.1:5432/kbase"
