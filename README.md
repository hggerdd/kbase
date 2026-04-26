# kbase

Capability-first personal knowledge base with a Python/FastAPI backend,
React/Vite frontend, Docker Compose runtime, PostgreSQL in containers, and
SQLite for local/test cases.

Current product surface: local/LAN web app for Notes, Files, Search, Projects,
Imports, Labels, and Categories. The backend is a modular monolith organized
around application capabilities, not around UI screens or raw table CRUD.

## Start Here

Canonical documentation:

- [docs/README.md](docs/README.md): documentation map and source-of-truth rules.
- [docs/architecture.md](docs/architecture.md): current architecture.
- [docs/data-map.md](docs/data-map.md): where code, database state, runtime files,
  logs, tests, and archived docs live.
- [docs/api.md](docs/api.md): current HTTP API.
- [docs/frontend.md](docs/frontend.md): current React app.
- [docs/auth-acl.md](docs/auth-acl.md): auth and ACL model.
- [docs/capabilities.md](docs/capabilities.md): capability coverage matrix.
- [docs/product-model.md](docs/product-model.md): product/domain model.
- [todo.md](todo.md): canonical backlog with stable task IDs.

Historical material is in [docs/archive](docs/archive/). Treat it as background
only. If archive content conflicts with source code or canonical docs, the
source code and canonical docs win.

## Current State

Implemented:

- FastAPI backend over shared application capabilities.
- React/Vite frontend with session login and hash-based navigation.
- Typer CLI over the same application capability layer.
- Relational schema for items, content, files, labels, categories, links,
  projects, ACL tables, audit, provenance, users, sessions, and API tokens.
- Hierarchical label nodes and label assignment/replacement.
- Label deactivate/reactivate lifecycle plus explicit hard-delete subtree cleanup.
- Category management in API, CLI, and frontend.
- File upload/import, inbox import, file-item storage, and file content delivery.
- Docker Compose setups for development and production.
- Python unit/integration/contract tests plus focused frontend Node tests.

Known gaps:

- ACL tables and endpoints exist, but runtime ACL enforcement is incomplete.
- CLI still defaults to local `--actor heiko`; it is not token/session based yet.
- Search history is intentionally browser-local for now; `saved_queries` exists
  in the schema as unused future storage.
- OCR, derived previews, bulk import, tasks, events, measurements, MCP, and agent
  adapters are later work.

## Project Map

```text
src/kbase/core/                  domain entities, policies, rules, value objects
src/kbase/application/           DTOs, capabilities, mappers, shared services
src/kbase/infrastructure/db/     SQL schema, bootstrap, sessions, UoW, repositories
src/kbase/infrastructure/files/  inbox and item-file storage helpers
src/kbase/interfaces/api/        FastAPI app and HTTP schemas
src/kbase/interfaces/cli/        Typer CLI
frontend/                        React/Vite app
tests/                           Python unit, integration, contract, CLI tests
scripts/                         DB init and seed helpers
kb/                              local runtime data: db, inbox, items, logs
docs/                            canonical docs plus archive
```

## Requirements

Container workflow:

- Docker Desktop or Docker Engine with Compose.

Local workflow:

- Python 3.12+
- `uv`
- Node.js 20+

Use `uv` for Python commands. Do not call `python` directly unless there is a
specific reason.

## Docker Development

```powershell
docker compose -f compose.dev.yaml up --build
```

Endpoints:

```text
Frontend: http://127.0.0.1:5173
API:      http://127.0.0.1:8000
Postgres: 127.0.0.1:5432
```

Windows LAN helper:

```powershell
.\start-lan-dev.bat
```

## Docker Production

```powershell
docker compose -f compose.prod.yaml up --build -d
docker compose -f compose.prod.yaml down
```

Endpoints:

```text
Frontend: http://127.0.0.1:8080
API:      http://127.0.0.1:8000
Postgres: 127.0.0.1:5432
```

## Local Backend

```powershell
uv sync --extra dev
uv run python scripts/init_db.py
uv run uvicorn kbase.interfaces.api.main:app --reload
```

Default non-container DB URL:

```text
postgresql+psycopg://kbase:kbase@127.0.0.1:5432/kbase
```

SQLite support remains for legacy/local tests through `--db-path` and temporary
test databases.

## Local Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend defaults to same-origin API calls. Vite/Nginx proxy `/api` and
`/health` to the backend in Compose.

## Auth

Browser clients:

- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- identity is the server-side `kbase_session` cookie

API clients:

- create bearer tokens with `POST /api/auth/tokens`
- send tokens as `Authorization: Bearer <TOKEN>`

Seed/dev users:

```text
heiko / heiko-local-dev
wife  / wife-local-dev
```

Important current split:

- HTTP identity is session-cookie or bearer-token based.
- HTTP does not support `x-kbase-actor`.
- LAN access is not trusted for identity; LAN browsers still need sessions and
  LAN API clients still need bearer tokens.
- Credentialed browser origins are local-dev defaults unless explicitly set
  with `KBASE_CORS_ORIGINS`.
- Set `KBASE_TRUST_MODE=lan` or `KBASE_TRUST_MODE=production` to remove
  development CORS defaults; production Compose sets this automatically.
- Browser file uploads are capped by `KBASE_MAX_UPLOAD_BYTES`; the default is
  50 MiB.
- The frontend top-right chrome shows the deployment label, Git branch, commit,
  and commit date so testing sessions can confirm which build is running.
- CLI still accepts `--actor` and defaults to `heiko`; this gap is tracked as
  `SEC-006` in [todo.md](todo.md).

## CLI Examples

```powershell
uv run kbase --help
uv run kbase note create --title "Waschmaschine vergleichen" --category research --body "Bosch vs Siemens" --json
uv run kbase item list --item-kind note --json
uv run kbase category list --json
uv run kbase search content --query Bosch --json
```

## Tests

Python:

```powershell
uv run --extra dev pytest -q
```

Frontend:

```powershell
cd frontend
npm run test:layout
npm run test:files
npm run test:files:ui
npm run test:notes
npm run test:settings
npm run test:search
npm run build
```

## Git Workflow

- Start new work from `dev`.
- Merge feature branches into `dev`.
- Merge `dev` into `main` only for release-ready states.
- Hotfixes on `main` are exceptional and must be merged back to `dev`.
