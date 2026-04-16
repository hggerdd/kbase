from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from kbase.infrastructure.db.bootstrap import initialize_database
from kbase.infrastructure.db.session import create_session_factory


@pytest.fixture()
def session_factory(tmp_path):
    db_path = tmp_path / "test.sqlite"
    db_url = f"sqlite:///{db_path.as_posix()}"
    factory = create_session_factory(db_url)
    with factory().bind.begin() as connection:
        initialize_database(connection)
    return factory
