# TODO

This is the canonical backlog for the repository. Use stable task IDs so future
LLM threads can reference work without depending on line numbers.

Schema for every task:

```text
TASK-ID | Status | Priority | Area | Title
Source:
Acceptance:
```

Status values: `open`, `partial`, `blocked`, `done`.
Priority values: `high`, `medium`, `low`.

## Current Priorities

| ID | Status | Priority | Area | Title |
| --- | --- | --- | --- | --- |
| `SEC-002` | partial | high | acl | Enforce ACL for reads and writes |
| `TEST-001` | partial | high | tests | Add targeted tests for auth, ACL, XSS, labels, search, and files |
| `DOC-001` | partial | medium | docs | Keep canonical docs synced with code |
| `FILE-001` | open | medium | files | Move file explorer filtering/loading toward server-side pagination |
| `FILE-002` | partial | medium | files-ui | Improve file preview and summary editing UX |
| `AUTO-001` | open | low | automation | Add OCR, derivative previews, and bulk import pipeline |
| `MCP-001` | open | low | agents | Add MCP/agent adapter over existing capabilities |

## Recommended Implementation Groups

These tasks are complex enough that future agents should treat each group as a
planning project before changing code. Start each group by reading the listed
sources, writing a short implementation plan in the thread, and identifying the
tests that will prove the behavior.

1. Security and identity foundation: `SEC-002`, `SEC-006`, `TEST-001`,
   `DOC-001`.

   Goal: make runtime authorization and non-browser identity reliable before
   adding more integration surfaces. `SEC-002` should come before `MCP-001`
   because agent/API adapters must not expose operations that bypass ACL.
   `SEC-006` should be planned with API token/session docs so CLI examples do
   not keep normalizing the legacy actor default. `TEST-001` and `DOC-001` are
   cross-cutting work and should be updated as part of each security change, not
   left until the end.

2. File workspace performance and UX: `FILE-001`, `FILE-002`, `TEST-001`,
   `DOC-001`.

   Goal: make the file explorer scalable and predictable before broadening file
   automation. `FILE-001` defines the backend contract and loading model;
   `FILE-002` should build on that contract so preview and summary behavior do
   not depend on eager detail fetches for every file.

3. Automation pipeline: `AUTO-001`, with follow-up updates to `FILE-001`,
   `FILE-002`, `TEST-001`, and `DOC-001` where needed.

   Goal: add OCR, preview derivatives, and bulk import only after file storage,
   MIME trust, scan policy, and preview UX are explicit. This work should start
   with a pipeline design and failure model before implementation because it
   touches files, metadata, provenance, audit, and background processing.

4. Agent integration: `MCP-001`, after meaningful progress on `SEC-002` and
   `SEC-006`.

   Goal: expose existing capabilities to agents without creating new business
   logic or an alternate permission model. The adapter should be thin, auditable,
   and constrained by the same identity and ACL decisions as HTTP and CLI.

## Completed Current Priorities

| ID | Status | Priority | Area | Title |
| --- | --- | --- | --- | --- |
| `SEC-001` | done | high | auth | Finish local/LAN trust-boundary documentation |
| `SEC-003` | done | high | frontend-security | Add shared rich-content sanitization |
| `SEC-004` | done | high | cors | Harden and document CORS/client trust modes |
| `SEC-005` | done | high | files-security | Complete upload/download threat model |
| `SEC-006` | done | high | cli-auth | Replace CLI `--actor heiko` default with token/session-aware flow |
| `CLI-001` | done | high | categories | Add category commands to CLI |
| `LAB-001` | done | high | labels | Finalize label lifecycle decision |
| `LAB-002` | done | high | labels | Align delete/deactivate implementation with lifecycle decision |
| `SEARCH-001` | done | medium | search | Decide server-backed saved queries vs local-only search history |
| `SEARCH-002` | done | medium | search | Document exact label/category search semantics |
| `CAT-001` | done | medium | categories | Decide whether categories remain flat or become hierarchical |
| `FILE-SEC-001` | done | medium | files-security | Add upload size and rate limits |
| `FILE-SEC-002` | done | medium | files-security | Add MIME validation and malware scanning policy |
| `NOTE-001` | done | medium | notes | Add concurrent edit conflict strategy |
| `FE-001` | done | medium | frontend-tests | Add Settings/Labels and Settings/Categories workspace tests |
| `FE-002` | done | medium | frontend | Show current build/version in the app chrome |
| `FE-003` | done | medium | frontend | Refactor home into the primary notes workspace |

## Task Details

### `SEC-001` Finish Local/LAN Trust-Boundary Documentation

Source: `docs/auth-acl.md`, `docs/api.md`.

Acceptance:

- README, API docs, frontend docs, and auth plan describe the same model.
- Browser identity is documented as session-cookie based.
- API-client identity is documented as bearer-token based.
- LAN is explicitly documented as not trusted for identity.

### `SEC-002` Enforce ACL For Reads And Writes

Source: schema tables `item_acl`, `principal_memberships`; API ACL endpoints;
item, content, file, project, metadata, label, and category access paths.

Planning:

- Treat this as an architecture-level security change, not as route-by-route
  patching. Start by mapping every read and write path from HTTP, CLI, and
  capabilities to the item or collection being accessed.
- Define the authorization service in the application/core boundary so API and
  CLI adapters do not duplicate business rules.
- Decide how ownership/default access works for existing local data, seed data,
  project memberships, file attachments, labels, categories, and administrative
  operations before changing enforcement.
- Plan a migration or bootstrap strategy for existing rows that currently have
  no explicit ACL rows, and document any local-dev defaults separately from the
  production target.

Acceptance:

- Shared authorization service defines at least `view`, `edit`, and `manage`.
- Item reads, content reads, writes, uploads, project operations, and metadata
  operations check permissions consistently.
- Unauthorized requests return `403`.
- Tests cover allowed and forbidden cases for item detail, search/list reads,
  note edits, file upload/download, project item access, and label/category
  operations where ACL applies.
- Canonical docs explain the effective permission model, bootstrap defaults,
  and remaining gaps without referring to LAN trust as identity.

### `SEC-003` Add Shared Rich-Content Sanitization

Source: Notes editor, file summaries, Markdown/HTML rendering paths.

Acceptance:

- Notes and file summaries use the same sanitization pipeline.
- Script/event-handler payloads are neutralized before rendering.
- Unit or workspace tests cover representative stored-XSS payloads.

### `SEC-004` Harden And Document CORS/Client Trust Modes

Source: API CORS config, Docker dev/prod configs.

Acceptance:

- Dev, LAN, and production assumptions are described separately.
- Credentialed browser requests only work for intended origins.
- Unsafe defaults are either removed or labeled as development-only.

### `SEC-005` Complete Upload/Download Threat Model

Source: `ItemFileStore`, inbox store, file-content endpoint.

Acceptance:

- Path traversal controls are documented and tested.
- File size limits, MIME trust, malware scan gaps, and rate limits are tracked.
- Remaining risks become explicit backlog items.

### `SEC-006` Replace CLI Actor Default

Source: `src/kbase/interfaces/cli/main.py`, API auth/session/token
implementation, README CLI examples, `docs/auth-acl.md`, `docs/api.md`.

Planning:

- Treat this as an identity model change for automation and local tools. Decide
  whether the CLI should use bearer tokens, a local dev session/token helper, or
  an explicit local-only bootstrap mode before editing command behavior.
- Audit every CLI command that currently depends on `--actor` and map it to the
  same principal model used by HTTP.
- Keep any temporary local-dev escape hatch explicit, documented, and clearly
  separate from the target token/session-aware flow.
- Coordinate with `SEC-002` so CLI writes do not become a bypass around ACL
  checks.

Acceptance:

- Normal CLI commands no longer default to `--actor heiko`.
- CLI has a documented token or local-dev auth flow.
- Tests and README examples match the selected flow.
- API, auth, and frontend docs use the same identity language for browser,
  API-client, and CLI access.
- Any intentionally retained compatibility flag is documented as temporary,
  opt-in, and covered by tests.

### `CLI-001` Add Category Commands To CLI

Source: `create_category`, `list_categories`, `update_category` capabilities.

Acceptance:

- `uv run kbase category list|create|update` exists.
- CLI contract tests cover the commands.
- Capability matrix marks category CLI coverage as `yes`.

### `LAB-001` Finalize Label Lifecycle Decision

Source: current label APIs and historical label-management notes.

Acceptance:

- A short lifecycle spec defines `create`, `rename`, `deactivate`,
  `reactivate`, and `delete`.
- The spec states whether hard delete is allowed and what happens to subtrees.
- Search and UI behavior for inactive labels is explicit.

### `LAB-002` Align Delete/Deactivate Implementation

Source: `DELETE /api/labels/{label_id}`, Settings label delete UI.

Acceptance:

- Implementation matches `LAB-001`.
- API, CLI, frontend, docs, and tests use the same lifecycle language.
- No doc recommends deactivate while code silently encourages hard delete.

### `SEARCH-001` Decide Saved Queries Storage

Source: `saved_queries` table, frontend search state/history.

Acceptance:

- Decision recorded: server-backed capability or intentionally local-only.
- If server-backed, capability/API/frontend/test tasks are created.
- If local-only, schema is documented as unused future storage.

### `SEARCH-002` Document Label/Category Search Semantics

Source: `SearchContentInput`, `label_paths`, `label_path_prefixes`,
`category_keys`.

Acceptance:

- Exact label match and subtree/prefix match are explained with examples.
- API docs, frontend wording, and tests use the same terms.

### `CAT-001` Decide Category Hierarchy

Source: flat `item_categories` table and frontend wording.

Acceptance:

- Architecture decision states categories are flat or hierarchical.
- UI and docs stop implying unsupported hierarchy if categories stay flat.
- If hierarchical, data-model/API/UI tasks are created.

### `FILE-001` Server-Side File Filtering And Pagination

Source: file viewer page and hooks, item/search APIs, file item upload/list
behavior, `docs/frontend.md`, `docs/api.md`, `docs/data-map.md`.

Planning:

- Start by measuring and documenting the current file viewer loading path. The
  current UI should not need to fetch every file detail before it can render a
  useful explorer list.
- Design the backend contract first: filters, sort order, pagination cursor or
  offset, total/count behavior, item kinds, category filters, label filters,
  project filters, archived handling, and whether lightweight file metadata is
  included in list rows.
- Decide how the frontend tree, result list, and preview panel behave during
  paging, empty states, loading, and filter changes.
- Keep compatibility with existing item/file detail endpoints unless a planned
  API replacement is documented and tested.

Acceptance:

- Backend contract exists for filtered/paged file lists.
- Frontend no longer requires all file details before useful rendering.
- Tests cover API pagination/filtering behavior and frontend state transitions
  for loading, empty pages, selected file preservation, and filter changes.
- Performance target and expected maximum initial detail fetch count are
  documented.
- API and frontend docs describe the chosen contract and migration behavior.

### `FILE-002` Improve File Preview And Summary UX

Source: current Files page, file summary editor, file preview frame, stored path
display, upload/download threat model, `FILE-001`.

Planning:

- Build this on the file loading contract from `FILE-001` where possible. Avoid
  adding UI behavior that depends on eager detail loading for every file.
- Define preview behavior by MIME/kind before implementation: image, PDF, text,
  unsupported binary, missing file, oversized preview, and failed download.
- Decide whether summary edits are manual save, autosave, or both, and align
  conflict/error behavior with the notes editor where practical.
- Keep file path display readable without exposing unsafe filesystem assumptions
  or implying paths can be edited directly.

Acceptance:

- Stored paths wrap cleanly.
- Summary editor has a clear edit/save/autosave path.
- PDF/image/text preview behavior is defined and tested where feasible.
- Unsupported, missing, or blocked previews show explicit UI states.
- Tests cover summary editing success/failure and representative preview
  presentation behavior.
- Frontend docs describe supported preview types and known gaps.

### `FILE-SEC-001` Add Upload Size And Rate Limits

Source: `SEC-005` threat model.

Acceptance:

- API upload endpoints enforce a documented maximum file size.
- Inbox import has a documented maximum file size or explicit bypass rationale.
- Upload/download rate-limit strategy is selected and documented.
- Tests cover oversized upload rejection.

### `FILE-SEC-002` Add MIME Validation And Malware Scanning Policy

Source: `SEC-005` threat model.

Acceptance:

- MIME type is validated or explicitly stored as untrusted client metadata.
- Malware scanning decision is documented for local, LAN, and production-like
  modes.
- Any asynchronous scan status fields or backlog items are aligned with
  `AUTO-001`.

### `NOTE-001` Add Concurrent Edit Conflict Strategy

Source: autosave and note editor behavior.

Acceptance:

- Decision recorded: last-write-wins, optimistic locking, version checks, or
  another strategy.
- API and frontend behavior are documented.
- At least one concurrent-edit case is tested.

### `TEST-001` Targeted Risk Tests

Source: architecture/security review, open security/file/search tasks, existing
Python and frontend test suites.

Planning:

- Treat this as a risk-driven test plan, not one large test dump. Start by
  writing a coverage matrix that maps risks to existing tests and missing tests.
- Add tests alongside the feature area they protect: Python API/capability tests
  for backend contracts and Node frontend tests for UI state.
- Prioritize regression-prone paths: auth failure, ACL denial, stored XSS,
  label lifecycle, search filter semantics, file filtering, file security, and
  note/file edit conflicts.
- Keep test fixtures small and explicit so future agents can understand exactly
  what behavior is being protected.

Acceptance:

- Tests exist for auth failure, ACL denial, XSS sanitization, label lifecycle,
  saved-query/search decision, and file filtering/security.
- Any intentionally untested risk has a written rationale.
- The coverage matrix is recorded in canonical docs or in this task before the
  task is marked done.
- New tests run through the documented commands and do not require hidden local
  state.

### `FE-001` Settings Workspace Tests

Source: Settings/Labels and Settings/Categories pages.

Acceptance:

- Label create/rename/deactivate/reactivate/delete behavior has frontend tests.
- Category create/update/activate/deactivate behavior has frontend tests.

### `FE-002` Show Current Build/Version In App Chrome

Source: frontend app shell and Git/build metadata.

Acceptance:

- The frontend shows the current Git branch or deployment label in the top right
  corner.
- The frontend shows the latest commit hash and commit date used for the build.
- The display works for local/dev builds and production-like Docker builds.
- The implementation does not require a browser user to open dev tools to see
  whether they are on dev, prod, or a specific last commit.

### `FE-003` Refactor Home Into The Primary Notes Workspace

Source: `docs/mockups/notes-frontend-proposal.html`, existing notes workspace,
frontend navigation.

Acceptance:

- Home becomes the primary note workspace instead of a separate dashboard.
- The reduced primary navigation still exposes Home, Search, Files, Imports,
  and a reachable Settings entry.
- Home supports note search, note selection, autosave editing, category
  filtering, project filtering, label filtering, and note creation using the
  existing capabilities.
- Project-scoped note creation keeps the active project context.
- Frontend docs and focused tests reflect the new navigation and home behavior.

### `DOC-001` Keep Canonical Docs Synced

Source: README, docs map, architecture, API, frontend, data map, auth/ACL,
capability matrix, todo, and future behavior-changing work.

Planning:

- Treat docs as part of each implementation task, not a separate cleanup phase.
  Any behavior-changing branch should update canonical docs in the same commit
  series.
- Before editing docs, identify which files are source-of-truth for the behavior
  being changed. Avoid copying stale archive language into current docs.
- Keep stable task IDs in docs when describing gaps, and move closed work to
  done landmarks or completed priorities only when tests and behavior agree.
- Make docs explicit enough for a new agent to continue work without reading
  historical chats first.

Acceptance:

- README, API docs, frontend docs, data map, capability matrix, and TODO do not
  contradict the code.
- Historical docs are clearly marked when they are background only.
- Open gaps have stable task IDs and concrete next steps.
- Runtime examples and test commands match the current implementation.

### `MCP-001` Add MCP/Agent Adapter

Source: target architecture, existing application capabilities, auth/ACL model,
API/CLI contracts, `SEC-002`, `SEC-006`.

Planning:

- Do not start this until the identity and ACL plan is clear enough to prevent
  the adapter from becoming a privileged bypass.
- Inventory which existing capabilities are safe and useful for agents:
  search/list, item detail, note create/edit, file metadata, project membership,
  labels, and categories.
- Define tool schemas around capability DTOs instead of database tables or UI
  page concepts.
- Decide audit/provenance behavior for agent actions before allowing writes.
- Keep the adapter thin; any missing business behavior should become a
  capability task, not MCP-only logic.

Acceptance:

- MCP tools call existing capabilities, not new domain logic.
- Adapter docs describe auth, allowed operations, and data boundaries.
- Tool schemas are stable, documented, and covered by contract tests.
- Write operations preserve audit/provenance and enforce the same ACL checks as
  HTTP and CLI.
- Unsafe or unsupported operations fail closed with clear errors.

### `AUTO-001` OCR, Preview Derivatives, Bulk Import

Source: use cases, file viewer, metadata fields `ocr_status` and
`summary_status`.

Planning:

- Start with a pipeline design before implementation. This task spans file
  storage, derived artifacts, metadata, audit, provenance, retries, partial
  failure, and UI status reporting.
- Decide whether processing is synchronous, background-worker based, or a
  staged local-dev workflow. Document the operational requirements before
  adding fields or commands.
- Define artifact locations for originals, extracted text, thumbnails, preview
  images, OCR output, summaries, and error logs.
- Align MIME trust and malware-scan policy from `FILE-SEC-002` with what the
  automation is allowed to read or execute.
- Plan rollback and idempotency so re-running import or OCR does not duplicate
  items, links, files, or provenance rows.

Acceptance:

- Pipeline design separates original files, derived files, metadata, audit, and
  provenance.
- First implementation has rollback/error behavior and tests.
- OCR/preview/summary statuses are visible through API and frontend states where
  relevant.
- Bulk import handles partial success, retry, duplicate detection, and clear
  user-facing errors.
- Docs explain storage locations, operational assumptions, and known limitations.

## Done Landmarks

| ID | Status | Area | Result |
| --- | --- | --- | --- |
| `ARCH-001` | done | docs | README/API docs were synchronized with session/token auth and category endpoints. |
| `ARCH-002` | done | architecture | Capability matrix exists in `docs/capabilities.md`. |
| `FE-003` | done | frontend | Home now hosts the primary notes workspace with category, project, and label filters. |
| `FE-SEARCH-001` | done | search | Global search state and explicit Search page exist. |
| `FE-FILES-001` | done | files | Files page with configurable explorer tree and test seed files exists. |
| `FE-NOTES-001` | done | notes | Notes autosave with debounce exists. |
| `LAB-BASE-001` | done | labels | Hierarchical label nodes, label assignment, label replacement, and label settings exist. |
| `CAT-BASE-001` | done | categories | Category API and Settings/Categories frontend exist. |
| `PROJ-BASE-001` | done | projects | Project create/add/list capabilities, API endpoints, CLI commands, and page exist. |

## Historical Sources

Historical background lives under `docs/archive/`.

When archive files conflict with code, prefer the code plus the canonical docs
listed in `docs/README.md`.
