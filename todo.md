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
| `SEC-001` | done | high | auth | Finish local/LAN trust-boundary documentation |
| `SEC-002` | open | high | acl | Enforce ACL for reads and writes |
| `SEC-003` | done | high | frontend-security | Add shared rich-content sanitization |
| `SEC-004` | done | high | cors | Harden and document CORS/client trust modes |
| `SEC-005` | done | high | files-security | Complete upload/download threat model |
| `SEC-006` | open | high | cli-auth | Replace CLI `--actor heiko` default with token/session-aware flow |
| `CLI-001` | done | high | categories | Add category commands to CLI |
| `LAB-001` | done | high | labels | Finalize label lifecycle decision |
| `LAB-002` | done | high | labels | Align delete/deactivate implementation with lifecycle decision |
| `SEARCH-001` | done | medium | search | Decide server-backed saved queries vs local-only search history |
| `SEARCH-002` | done | medium | search | Document exact label/category search semantics |
| `CAT-001` | done | medium | categories | Decide whether categories remain flat or become hierarchical |
| `FILE-001` | open | medium | files | Move file explorer filtering/loading toward server-side pagination |
| `FILE-002` | partial | medium | files-ui | Improve file preview and summary editing UX |
| `FILE-SEC-001` | open | medium | files-security | Add upload size and rate limits |
| `FILE-SEC-002` | open | medium | files-security | Add MIME validation and malware scanning policy |
| `NOTE-001` | open | medium | notes | Add concurrent edit conflict strategy |
| `TEST-001` | open | high | tests | Add targeted tests for auth, ACL, XSS, labels, search, and files |
| `FE-001` | open | medium | frontend-tests | Add Settings/Labels and Settings/Categories workspace tests |
| `DOC-001` | partial | medium | docs | Keep canonical docs synced with code |
| `MCP-001` | open | low | agents | Add MCP/agent adapter over existing capabilities |
| `AUTO-001` | open | low | automation | Add OCR, derivative previews, and bulk import pipeline |

## Task Details

### `SEC-001` Finish Local/LAN Trust-Boundary Documentation

Source: `docs/auth-acl.md`, `docs/api.md`.

Acceptance:

- README, API docs, frontend docs, and auth plan describe the same model.
- Browser identity is documented as session-cookie based.
- API-client identity is documented as bearer-token based.
- LAN is explicitly documented as not trusted for identity.

### `SEC-002` Enforce ACL For Reads And Writes

Source: schema tables `item_acl`, `principal_memberships`, API ACL endpoints.

Acceptance:

- Shared authorization service defines at least `view`, `edit`, and `manage`.
- Item reads, content reads, writes, uploads, project operations, and metadata
  operations check permissions consistently.
- Unauthorized requests return `403`.
- Tests cover allowed and forbidden cases.

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

Source: `src/kbase/interfaces/cli/main.py`.

Acceptance:

- Normal CLI commands no longer default to `--actor heiko`.
- CLI has a documented token or local-dev auth flow.
- Tests and README examples match the selected flow.

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

Source: file viewer currently combines item summaries and detail fetches.

Acceptance:

- Backend contract exists for filtered/paged file lists.
- Frontend no longer requires all file details before useful rendering.
- Performance target and tests are documented.

### `FILE-002` Improve File Preview And Summary UX

Source: file viewer plan and current file page.

Acceptance:

- Stored paths wrap cleanly.
- Summary editor has a clear edit/save/autosave path.
- PDF/image/text preview behavior is defined and tested where feasible.

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

Source: architecture/security review.

Acceptance:

- Tests exist for auth failure, ACL denial, XSS sanitization, label lifecycle,
  saved-query/search decision, and file filtering/security.
- Any intentionally untested risk has a written rationale.

### `FE-001` Settings Workspace Tests

Source: Settings/Labels and Settings/Categories pages.

Acceptance:

- Label create/rename/deactivate/reactivate/delete behavior has frontend tests.
- Category create/update/activate/deactivate behavior has frontend tests.

### `DOC-001` Keep Canonical Docs Synced

Source: this cleanup and future code changes.

Acceptance:

- README, API docs, frontend docs, data map, capability matrix, and TODO do not
  contradict the code.
- Historical docs are clearly marked when they are background only.

### `MCP-001` Add MCP/Agent Adapter

Source: target architecture.

Acceptance:

- MCP tools call existing capabilities, not new domain logic.
- Adapter docs describe auth, allowed operations, and data boundaries.

### `AUTO-001` OCR, Preview Derivatives, Bulk Import

Source: use cases, file viewer, metadata fields `ocr_status` and
`summary_status`.

Acceptance:

- Pipeline design separates original files, derived files, metadata, audit, and
  provenance.
- First implementation has rollback/error behavior and tests.

## Done Landmarks

| ID | Status | Area | Result |
| --- | --- | --- | --- |
| `ARCH-001` | done | docs | README/API docs were synchronized with session/token auth and category endpoints. |
| `ARCH-002` | done | architecture | Capability matrix exists in `docs/capabilities.md`. |
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
