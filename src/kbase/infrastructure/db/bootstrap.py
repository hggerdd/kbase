from __future__ import annotations

from pathlib import Path

from sqlalchemy import text
from sqlalchemy.engine import Connection


ROOT = Path(__file__).resolve().parents[4]
SQL_DIR = ROOT / "src" / "kbase" / "infrastructure" / "db" / "sql"


def load_sql(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def initialize_database(connection: Connection) -> None:
    dialect = connection.engine.dialect.name
    schema_sql = _normalize_schema_sql(load_sql(SQL_DIR / "001_schema.sql"), dialect)
    seed_sql = _normalize_seed_sql(load_sql(SQL_DIR / "002_seed_reference_data.sql"), dialect)

    for statement in _split_sql_statements(schema_sql):
        connection.execute(text(statement))
    for statement in _split_sql_statements(seed_sql):
        connection.execute(text(statement))


def _normalize_schema_sql(sql_text: str, dialect: str) -> str:
    if dialect == "sqlite":
        return sql_text
    return "\n".join(
        line for line in sql_text.splitlines() if not line.lstrip().upper().startswith("PRAGMA ")
    )


def _normalize_seed_sql(sql_text: str, dialect: str) -> str:
    if dialect == "postgresql":
        return sql_text.replace("INSERT OR IGNORE INTO", "INSERT INTO").replace(
            ");", ") ON CONFLICT DO NOTHING;"
        )
    return sql_text


def _split_sql_statements(sql_text: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []
    in_single_quote = False
    in_double_quote = False
    previous = ""

    for char in sql_text:
        if char == "'" and not in_double_quote and previous != "\\":
            in_single_quote = not in_single_quote
        elif char == '"' and not in_single_quote and previous != "\\":
            in_double_quote = not in_double_quote

        if char == ";" and not in_single_quote and not in_double_quote:
            statement = "".join(current).strip()
            if statement:
                statements.append(statement)
            current = []
        else:
            current.append(char)
        previous = char

    tail = "".join(current).strip()
    if tail:
        statements.append(tail)
    return statements
