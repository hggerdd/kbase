# Data Map

This document explains where project data lives. It is written for future LLM
threads first: use it to avoid confusing source code, runtime state, seed data,
and historical design notes.

## Source Code

```text
src/kbase/core/
```

Domain entities, policies, rules, and value objects. This layer should not know
about FastAPI, Typer, React, SQLAlchemy sessions, or filesystem layout.

```text
src/kbase/application/
```

Capability layer and DTOs. This is the main domain-facing API used by CLI,
HTTP, and future adapters. A write capability is the normal transaction boundary.

```text
src/kbase/infrastructure/
```

Database, repositories, auth/security helpers, unit of work, and filesystem
storage helpers.

```text
src/kbase/interfaces/api/
src/kbase/interfaces/cli/
```

FastAPI and Typer adapters. These should call application capabilities instead
of reimplementing business rules.

```text
frontend/src/
```

React/Vite client. Feature code is split into `features/<area>` for API/hooks
and `pages/<area>` for page-level UI.

## Database Definition

```text
src/kbase/infrastructure/db/sql/001_schema.sql
```

Canonical schema used by bootstrap for SQLite and PostgreSQL. It contains:

- reference tables: item kinds, categories, content-part kinds, asset kinds,
  link types, permissions, subject relation types, metadata fields/groups
- identity/security: principals, memberships, users, sessions, API tokens
- item core: items, classifications, content parts, versions, item files
- assets: assets and item-assets
- structure: label nodes, item labels, links, metadata
- projects: project item relation
- ACL/subjects: item ACL and item subjects
- traceability: audit events, provenance records, saved queries

```text
src/kbase/infrastructure/db/sql/002_seed_reference_data.sql
```

Reference data and dev principals/categories/metadata fields. Category seed
rows include root `full_path` values so hierarchical category filtering works
from a fresh database. Bootstrap adds default dev users separately.

```text
src/kbase/infrastructure/db/bootstrap.py
```

Loads schema/seed SQL and ensures default local users:

```text
heiko / heiko-local-dev
wife  / wife-local-dev
```

## Runtime Data

```text
kb/db/
```

Local SQLite files. This is legacy/local runtime state and test-adjacent data,
not the container default database.

```text
kb/items/
```

Stored item files. Current buckets:

```text
kb/items/documents/
kb/items/images/
kb/items/spreadsheets/
kb/items/summaries/
```

`ItemFileStore` builds paths as:

```text
<kind-folder>/<bucket>/<prefix>_<item_id>_<slug><extension>
```

All stored item-file paths must resolve below this root. `ItemFileStore`
constructs normal stored paths and rejects traversal outside the configured
storage root.

Examples:

- documents: `doc_<id>_<slug>.pdf`
- images: `img_<id>_<slug>.png`
- spreadsheets: `sheet_<id>_<slug>.csv`
- summaries: `summary_<id>_<slug>.md`

The bucket is derived from the item id to keep directories small.

```text
kb/inbox/
```

Inbox import area:

- `raw/`: files waiting for import
- `processing/`: transient processing area
- `rejected/`: rejected/problem files

Inbox raw, processing, and rejected operations are root-confined. Import paths
must resolve below `raw/`, and move destinations must remain inside their
target inbox folder.

```text
kb/logs/
```

Local API/dev logs.

```text
kb/workspaces/
kb/exports/
```

Reserved runtime folders for project/review workspaces and exports.

## Container Data

Docker Compose runs PostgreSQL as a service and mounts `kb/` into the API
container for file storage and logs.

Development:

```text
compose.dev.yaml
```

Production-like local run:

```text
compose.prod.yaml
```

The database is PostgreSQL in Compose. SQLite remains relevant for tests and
legacy/local use.

## Tests And Fixtures

```text
tests/
```

Python tests:

- `tests/unit/`
- `tests/integration/`
- `tests/contract/`

```text
frontend/src/**/*.test.js
```

Frontend Node tests for layout, files, notes, and settings behavior.

```text
scripts/seed_file_viewer_test_data.py
```

Creates file-viewer test data in the local system.

## Documentation Data

Canonical current docs:

- `README.md`
- `todo.md`
- `docs/README.md`
- `docs/architecture.md`
- `docs/data-map.md`
- `docs/api.md`
- `docs/frontend.md`
- `docs/auth-acl.md`
- `docs/capabilities.md`
- `docs/product-model.md`

Historical/background docs:

- `docs/archive/`
- `docs/archive/01_input/`
- `docs/archive/02_ideas/`
- `docs/archive/implementation-plans/`
- `docs/archive/use-cases.md`
- `docs/archive/kb-design-summary.md`
- `docs/archive/technology-proposals.md`

Historical docs are useful for intent, but the code plus canonical docs win on
current behavior.

## Configuration Knobs

Backend:

- `KBASE_DB_URL`: database URL.
- `KBASE_STORAGE_ROOT`: overrides item-file storage root.
- `KBASE_MAX_UPLOAD_BYTES`: maximum accepted size for browser upload
  endpoints. Defaults to `52428800` bytes, or 50 MiB.
- `KBASE_TRUST_MODE`: `local`, `lan`, or `production`; local keeps development
  CORS defaults, LAN and production require explicit browser origins.
- `KBASE_CORS_ORIGINS`: comma-separated allowed browser origins; wildcard
  origins are rejected because browser credentials are enabled.

Saved queries:

- The `saved_queries` table exists in the schema for future server-backed saved
  searches.
- It is not used by current capabilities, API routes, CLI commands, or the
  current frontend.

Frontend:

- `VITE_API_BASE_URL`: optional API base override. Empty/same-origin default is
  preferred for Compose.
- `VITE_KBASE_DEPLOYMENT_LABEL`: visible frontend deployment label, normally
  `dev` or `prod`.
- `VITE_KBASE_GIT_BRANCH`, `VITE_KBASE_GIT_COMMIT`, and
  `VITE_KBASE_GIT_COMMIT_DATE`: optional frontend build metadata overrides for
  Docker/CI builds when `.git` is not available inside the build context.

Do not reintroduce client-side actor configuration. Browser identity is derived
from the server session.
