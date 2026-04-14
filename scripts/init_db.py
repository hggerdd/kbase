from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SQL_DIR = ROOT / "src" / "kbase" / "infrastructure" / "db" / "sql"
DEFAULT_DB_PATH = ROOT / "kb" / "db" / "kbase.sqlite"


def load_sql(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def init_db(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)

    schema_sql = load_sql(SQL_DIR / "001_schema.sql")
    seed_sql = load_sql(SQL_DIR / "002_seed_reference_data.sql")

    with sqlite3.connect(db_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON;")
        connection.execute("PRAGMA journal_mode = WAL;")
        connection.execute("PRAGMA synchronous = NORMAL;")
        connection.execute("PRAGMA busy_timeout = 5000;")
        connection.executescript(schema_sql)
        connection.executescript(seed_sql)
        connection.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize the local SQLite database.")
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"SQLite database path. Default: {DEFAULT_DB_PATH}",
    )
    args = parser.parse_args()

    init_db(args.db_path)
    print(f"Initialized database at: {args.db_path}")


if __name__ == "__main__":
    main()
