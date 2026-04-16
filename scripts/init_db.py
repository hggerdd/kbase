from __future__ import annotations

import argparse
from pathlib import Path

from sqlalchemy import create_engine

from kbase.infrastructure.db.bootstrap import ROOT, initialize_database
from kbase.infrastructure.db.session import _default_db_url


DEFAULT_DB_PATH = ROOT / "kb" / "db" / "kbase.sqlite"


def init_db(db_url: str) -> None:
    engine = create_engine(db_url, future=True, pool_pre_ping=True)
    if engine.dialect.name == "sqlite":
        db_path = Path(engine.url.database or DEFAULT_DB_PATH)
        db_path.parent.mkdir(parents=True, exist_ok=True)
    with engine.begin() as connection:
        initialize_database(connection)


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize the configured database schema and seed data.")
    parser.add_argument(
        "--db-path",
        type=Path,
        help=f"Legacy SQLite database path. If set, overrides --db-url. Default path: {DEFAULT_DB_PATH}",
    )
    parser.add_argument(
        "--db-url",
        default=None,
        help="Database URL. Defaults to KBASE_DB_URL or the project default Postgres URL.",
    )
    args = parser.parse_args()

    db_url = args.db_url
    if args.db_path is not None:
        db_url = f"sqlite:///{args.db_path.as_posix()}"
    if db_url is None:
        db_url = _default_db_url()

    init_db(db_url)
    print(f"Initialized database at: {db_url}")


if __name__ == "__main__":
    main()
