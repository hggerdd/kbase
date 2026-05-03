# Architecture

`kbase` is a capability-first modular monolith.

The central rule: clients do not own domain behavior. CLI, HTTP, frontend, and
future agent adapters call the same application capabilities.

## Layers

```text
Clients
  React frontend
  Typer CLI
  future MCP/agent adapters
        |
Interfaces
  src/kbase/interfaces/api/
  src/kbase/interfaces/cli/
        |
Application
  src/kbase/application/capabilities/
  src/kbase/application/dto/
  src/kbase/application/services/
        |
Domain Core
  src/kbase/core/entities/
  src/kbase/core/policies/
  src/kbase/core/rules/
  src/kbase/core/value_objects/
        |
Infrastructure
  src/kbase/infrastructure/db/
  src/kbase/infrastructure/files/
  src/kbase/infrastructure/auth/
```

## Current Runtime

- Docker dev/prod use PostgreSQL.
- Local tests use temporary SQLite databases.
- Stored files live in `kb/items/`.
- Inbox files live in `kb/inbox/`.
- Frontend is React/Vite and calls the API through same-origin `/api` by
  default.
- API is FastAPI.
- CLI is Typer.
- Python commands should run through `uv`.

## Capability Boundary

A capability is a named use case, for example:

- `create_note`
- `get_item`
- `replace_content_part`
- `search_content`
- `create_label`
- `import_file_as_item`
- `create_project`

Expected behavior:

- A write capability is the transaction boundary.
- Validation and domain-level decisions belong in capabilities/services/core, not
  in FastAPI routes, Typer commands, or React components.
- Audit/provenance records should be written with the mutation they describe.
- Interfaces translate transport/UI input into capability DTOs.

## Current Domain Model

Implemented core:

- `items`: notes, documents, images, spreadsheets, summaries, projects, and
  future task/event kinds.
- `content_parts`: markdown/text/summary/OCR-like content attached to items.
- `item_files`: stored file records for file-backed items.
- `label_nodes`: hierarchical labels.
- `item_labels`: item-to-label assignments.
- `item_categories`: managed category keys with optional `applies_to_kind`,
  `parent_key`, `full_path`, and `depth`.

Category decision:

- Categories are hierarchical reference taxonomy nodes.
- Items still store one primary `category_key`; the hierarchy lives in
  `item_categories` and is used for UI tree display and subtree search.
- Exact category filters (`category_keys`) remain exact. Branch filters use
  category `full_path` prefixes through `category_path_prefixes`.
- Labels remain the more flexible user taxonomy for multi-label organization.
- `item_links`: relations between items.
- `project_items`: project-to-item membership.
- Item-to-project replacement is a capability (`replace_item_projects`) because
  moving a note between projects affects shared project membership state and
  must enforce permissions on the item and the touched projects.
- `item_metadata`: typed metadata fields.
- `audit_events` and `provenance_records`: traceability.
- `users`, `user_sessions`, `api_tokens`, `principals`,
  `principal_memberships`, and `item_acl`: identity and permission foundation.

## Current Gaps

- Legacy items with no ACL rows still fall back to authenticated-user
  visibility.
- Global label/category administration is authenticated but not separately
  admin-scoped.
- Saved queries are in the schema but not implemented as a server-backed
  capability.
- Note-linked image/PDF previews currently render originals inline. Generated
  preview derivatives are not implemented yet.
- OCR, derived previews, bulk imports, tasks, events, measurements, and MCP are
  future work.

Track gaps in [../todo.md](../todo.md), not in scattered planning notes.

## Design Bias

- Prefer extending an existing capability over creating parallel interface logic.
- Prefer explicit DTOs and repositories over ad hoc dictionaries across layers.
- Prefer schema-backed facts over frontend-only state when behavior must be
  shared by CLI/API/agents.
- Prefer small focused tests for capabilities, API contracts, and pure frontend
  state transformations.
