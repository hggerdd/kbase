from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from kbase.infrastructure.db.session import create_session_factory


def _read_sql(path: Path) -> str:
    return path.read_text(encoding="utf-8")


@pytest.fixture()
def session_factory(tmp_path):
    db_path = tmp_path / "test.sqlite"
    schema_path = ROOT / "src" / "kbase" / "infrastructure" / "db" / "sql" / "001_schema.sql"
    seed_path = ROOT / "src" / "kbase" / "infrastructure" / "db" / "sql" / "002_seed_reference_data.sql"

    with sqlite3.connect(db_path) as connection:
        connection.executescript(_read_sql(schema_path))
        connection.executescript(_read_sql(seed_path))
        connection.commit()

    return create_session_factory(f"sqlite:///{db_path}")

