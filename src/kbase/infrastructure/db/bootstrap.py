from __future__ import annotations

from pathlib import Path

from sqlalchemy import text
from sqlalchemy.engine import Connection

from kbase.infrastructure.auth.security import hash_password
from kbase.infrastructure.db.repositories.helpers import new_id, utc_now


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
    _ensure_category_hierarchy_columns(connection)
    _ensure_user_preferences_table(connection)
    for statement in _split_sql_statements(seed_sql):
        connection.execute(text(statement))
    _backfill_category_hierarchy(connection)
    _ensure_default_users(connection)


def _normalize_schema_sql(sql_text: str, dialect: str) -> str:
    lines = [
        line
        for line in sql_text.splitlines()
        if not line.lstrip().startswith("CREATE INDEX IF NOT EXISTS idx_item_categories_")
    ]
    if dialect == "sqlite":
        return "\n".join(lines)
    return "\n".join(
        line for line in lines if not line.lstrip().upper().startswith("PRAGMA ")
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


def _ensure_default_users(connection: Connection) -> None:
    defaults = [
        ("heiko", "heiko", "heiko-local-dev"),
        ("wife", "wife", "wife-local-dev"),
    ]
    for username, principal_id, password in defaults:
        existing = connection.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": username},
        ).scalar_one_or_none()
        if existing is not None:
            continue
        now = utc_now()
        connection.execute(
            text(
                """
                INSERT INTO users (
                    id, username, password_hash, principal_id, is_active, created_at, updated_at
                ) VALUES (
                    :id, :username, :password_hash, :principal_id, 1, :created_at, :updated_at
                )
                """
            ),
            {
                "id": new_id(),
                "username": username,
                "password_hash": hash_password(password),
                "principal_id": principal_id,
                "created_at": now,
                "updated_at": now,
            },
        )


def _ensure_category_hierarchy_columns(connection: Connection) -> None:
    dialect = connection.engine.dialect.name
    if dialect == "sqlite":
        columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(item_categories)")).fetchall()
        }
        if "parent_key" not in columns:
            connection.execute(text("ALTER TABLE item_categories ADD COLUMN parent_key TEXT"))
        if "full_path" not in columns:
            connection.execute(text("ALTER TABLE item_categories ADD COLUMN full_path TEXT NOT NULL DEFAULT ''"))
        if "depth" not in columns:
            connection.execute(text("ALTER TABLE item_categories ADD COLUMN depth INTEGER NOT NULL DEFAULT 0"))
    else:
        connection.execute(text("ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS parent_key TEXT"))
        connection.execute(text("ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS full_path TEXT NOT NULL DEFAULT ''"))
        connection.execute(text("ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS depth INTEGER NOT NULL DEFAULT 0"))
    connection.execute(text("UPDATE item_categories SET full_path = key WHERE full_path = '' OR full_path IS NULL"))
    connection.execute(text("CREATE INDEX IF NOT EXISTS idx_item_categories_parent ON item_categories(parent_key)"))
    connection.execute(text("CREATE INDEX IF NOT EXISTS idx_item_categories_full_path ON item_categories(full_path)"))
    connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_item_categories_full_path ON item_categories(full_path)"))


def _ensure_user_preferences_table(connection: Connection) -> None:
    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS user_preferences (
                principal_id TEXT NOT NULL,
                preference_key TEXT NOT NULL,
                value_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (principal_id, preference_key),
                FOREIGN KEY (principal_id) REFERENCES principals(id)
            )
            """
        )
    )


def _backfill_category_hierarchy(connection: Connection) -> None:
    connection.execute(text("UPDATE item_categories SET full_path = key, depth = 0 WHERE parent_key IS NULL"))
