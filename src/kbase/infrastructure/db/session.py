from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker


_session_factory: sessionmaker[Session] | None = None


def _default_db_url() -> str:
    env_db_url = os.getenv("KBASE_DB_URL")
    if env_db_url:
        return env_db_url
    root = Path(__file__).resolve().parents[4]
    db_path = root / "kb" / "db" / "kbase.sqlite"
    return f"sqlite:///{db_path.as_posix()}"


def _configure_sqlite(engine: Engine) -> None:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, _connection_record) -> None:  # type: ignore[no-untyped-def]
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys = ON")
        cursor.execute("PRAGMA journal_mode = WAL")
        cursor.execute("PRAGMA synchronous = NORMAL")
        cursor.execute("PRAGMA busy_timeout = 5000")
        cursor.close()


def create_session_factory(db_url: str | None = None) -> sessionmaker[Session]:
    engine = create_engine(db_url or _default_db_url(), future=True)
    if engine.dialect.name == "sqlite":
        _configure_sqlite(engine)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, class_=Session)


def get_session_factory() -> sessionmaker[Session]:
    global _session_factory
    if _session_factory is None:
        _session_factory = create_session_factory()
    return _session_factory
