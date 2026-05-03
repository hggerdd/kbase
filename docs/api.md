# API

Status: current as of 2026-04-29.

The FastAPI layer is an adapter over application capabilities. It should not
contain separate domain logic.

## Run

```powershell
uv run uvicorn kbase.interfaces.api.main:app --reload
```

Default URL:

```text
http://127.0.0.1:8000
```

OpenAPI:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/openapi.json`

## Auth

Supported:

- Browser session cookie from `POST /api/auth/login`.
- Bearer token from `POST /api/auth/tokens`.

Unsupported:

- `x-kbase-actor`.
- anonymous domain endpoint access.

Optional correlation header:

```text
x-kbase-request-id: req-123
```

Dev users created by DB bootstrap:

```text
heiko / heiko-local-dev
wife  / wife-local-dev
```

## Trust And CORS

Browser requests use credentials and server-side session identity. The browser
must not choose a principal. Non-browser API clients use
`Authorization: Bearer <TOKEN>` created through an authenticated session.

Default development origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Set LAN/custom origins through `KBASE_CORS_ORIGINS`. Because the API allows
credentialed browser requests, wildcard CORS origins are rejected.

Trust modes:

- Local development uses the default localhost/`127.0.0.1` origins and the same
  session-cookie or bearer-token identity model as every other mode. This is the
  default `KBASE_TRUST_MODE=local`.
- LAN development is not a trusted identity boundary. LAN browsers need valid
  session cookies, LAN API clients need bearer tokens, and allowed browser
  origins must be listed explicitly in `KBASE_CORS_ORIGINS`. Use
  `KBASE_TRUST_MODE=lan` when the API is exposed for LAN browser testing.
- Production-like deployments should prefer same-origin frontend/API routing
  through Nginx. Configure cross-origin credentialed browser access only for
  intended origins. `KBASE_TRUST_MODE=production` has no default CORS origins.

## Quickstart

```powershell
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -c cookies.txt `
  -d "{\"username\":\"heiko\",\"password\":\"heiko-local-dev\"}"
curl -b cookies.txt http://127.0.0.1:8000/api/auth/session
curl -X POST http://127.0.0.1:8000/api/notes `
  -H "Content-Type: application/json" `
  -b cookies.txt `
  -d "{\"title\":\"Waschmaschine vergleichen\",\"category_key\":\"research\",\"markdown_body\":\"Bosch vs Siemens\"}"
```

Create API token:

```powershell
curl -X POST http://127.0.0.1:8000/api/auth/tokens `
  -H "Content-Type: application/json" `
  -b cookies.txt `
  -d "{\"token_label\":\"cli-dev\"}"
```

Use bearer token:

```powershell
curl http://127.0.0.1:8000/api/items/<ITEM_ID> `
  -H "Authorization: Bearer <TOKEN>"
```

## Endpoint Groups

Health:

- `GET /health`

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/auth/tokens`

Notes and items:

- `POST /api/notes`
- `GET /api/items`
- `GET /api/items/{item_id}`
- `PATCH /api/items/{item_id}`
- `PUT /api/items/{item_id}/content`
- `PUT /api/items/{item_id}/projects`
- `PATCH /api/items/{item_id}/metadata`
- `POST /api/items/{item_id}/classification`

Search:

- `GET /api/search/content`

Saved queries:

- No saved-query endpoints are exposed.
- The current frontend search history is browser-local.
- The `saved_queries` table is reserved future storage.

Labels:

- `GET /api/labels`
- `POST /api/labels`
- `PATCH /api/labels/{label_id}`
- `DELETE /api/labels/{label_id}`
- `POST /api/labels/{label_id}/deactivate`
- `POST /api/labels/{label_id}/reactivate`
- `POST /api/items/{item_id}/labels`
- `PUT /api/items/{item_id}/labels`

Label lifecycle:

- `POST /api/labels` creates an active label node.
- `PATCH /api/labels/{label_id}` renames the label or updates its description.
- `POST /api/labels/{label_id}/deactivate` hides a label from normal active
  listings while keeping the label and item assignments.
- `POST /api/labels/{label_id}/reactivate` returns the label to active listings.
- `DELETE /api/labels/{label_id}` hard-deletes the selected label subtree and
  removes item assignments to deleted labels.
- `GET /api/labels` excludes inactive labels unless `include_inactive=true`.

Categories:

- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/{category_key}`
- `DELETE /api/categories/{category_key}`

Category model:

- Categories are managed reference keys with optional hierarchy.
- `key` remains the stable item-facing value stored in `items.category_key`.
- `parent_key`, `full_path`, and `depth` describe the category tree.
- `applies_to_kind=null` means the category is valid for all item kinds.
- Child categories must be compatible with their parent scope: a global parent
  can have global or kind-specific children; a kind-specific parent can only
  have children of the same kind.
- Deleting a category is blocked while items/classifications or child
  categories still reference it.

Files, assets, and inbox:

- `POST /api/assets`
- `POST /api/items/{item_id}/assets`
- `POST /api/items/{item_id}/attachments/upload`
- `POST /api/file-items/upload`
- `GET /api/items/{item_id}/files/{file_id}/content`
- `GET /api/inbox/files`
- `POST /api/inbox/import`

## File Security Model

Upload/import paths:

- Browser uploads are read by FastAPI and stored through `ItemFileStore`.
- Inbox imports can only resolve files below `kb/inbox/raw`.
- Inbox processing and rejection moves must stay below their matching inbox
  folders.
- Stored item files are written below `kb/items/` or `KBASE_STORAGE_ROOT`.
- Download responses resolve the stored relative path through `ItemFileStore`
  before serving bytes.

Current controls:

- Original upload filenames are reduced to a basename before storage-path
  construction.
- Browser upload endpoints reject request bodies larger than
  `KBASE_MAX_UPLOAD_BYTES`. The default is `52428800` bytes, or 50 MiB.
- Browser upload MIME types are normalized before storage and download. Known
  browser-executable types such as `text/html`, `application/xhtml+xml`, and
  `image/svg+xml` are served as `application/octet-stream`.
- Stored file responses are served with inline content disposition so supported
  browser preview surfaces can render images and PDFs without forcing a
  download. Unsafe browser-executable MIME types are still neutralized.
- Item file paths are generated from item kind, item id, title slug, and original
  extension.
- Path traversal outside storage, raw inbox, processing inbox, or rejected inbox
  roots raises an error.
- Download of a stored path outside the item-file root returns `400`.

Known file-security gaps:

- Inbox import reads files that already exist below `kb/inbox/raw`. It does not
  enforce `KBASE_MAX_UPLOAD_BYTES`; operators should keep the raw inbox local or
  controlled until the import pipeline gets background scanning and quotas.
- MIME type remains metadata for display/preview hints, not proof of safe file
  contents.
- Malware scanning is not implemented in-process. Local mode accepts this as a
  single-machine user responsibility; LAN and production-like deployments should
  keep uploads restricted to trusted users and add scanning at the import/storage
  boundary before broader sharing.
- In-process per-user upload/download rate limits are not implemented. For LAN
  or production-like exposure, put coarse request/body rate limits at the
  reverse proxy until `SEC-002`/future quota work can identify users
  consistently at the application layer.
- Preview/OCR derivative generation is future work and must keep originals and
  derived files separate.

Links and projects:

- `POST /api/links`
- `DELETE /api/links/{link_id}`
- `GET /api/items/{item_id}/links`
- `PUT /api/items/{item_id}/projects`
- `POST /api/projects`
- `POST /api/projects/{project_id}/items`
- `GET /api/projects/{project_id}/items`

`POST /api/links` creates an item-to-item relation through `link_items` and
returns the updated source item detail. The notes frontend relies on this
server-returned detail instead of synthesizing links locally.

`DELETE /api/links/{link_id}` removes an item relation through `unlink_items`
and returns the updated source item detail.

`PUT /api/items/{item_id}/projects` replaces the complete project membership
set for an item and returns the updated item detail. The caller must be able to
edit the item, all currently linked projects, and all target projects.

Traceability and ACL:

- `GET /api/items/{item_id}/history`
- `GET /api/items/{item_id}/provenance`
- `GET /api/items/{item_id}/acl`
- `PUT /api/items/{item_id}/acl`

## Important Query Parameters

`GET /api/items`:

- `item_kind`
- `category_key`
- `include_archived`
- `limit`
- `offset`

`PUT /api/items/{item_id}/content`:

- Replaces the primary content part by default.
- `expected_content_updated_at` is optional. When provided, it must match the
  current content part `updated_at` value from `GET /api/items/{item_id}`.
- A stale `expected_content_updated_at` returns `409` and leaves content
  unchanged.

`GET /api/search/content`:

- `query`
- `item_kinds`
- `category_keys`
- `category_path_prefixes`
- `label_paths`
- `label_path_prefixes`
- `statuses`
- `created_by_principal_ids`
- `project_id`
- `include_archived`
- `limit`
- `offset`

Search filter semantics:

- `query` is a text contains search across title, category key, status, content
  text, label name, label full path, and label description.
- `item_kinds`, `category_keys`, `statuses`, and `created_by_principal_ids` are
  exact-key filters. Multiple values inside one field are OR alternatives.
- `category_keys=research&category_keys=decision` means category is exactly
  `research` OR exactly `decision`.
- `category_path_prefixes` is a branch filter over category `full_path`.
  `knowledge` matches `knowledge` and descendants such as
  `knowledge/knowledge_research`.
- `label_paths` is an exact full-path label filter. `finance/bank` does not
  match an item labeled only `finance/bank/depot/data`.
- `label_path_prefixes` is a branch filter. `finance/bank` matches
  `finance/bank` and descendants such as `finance/bank/depot/data`.
- Exact label paths and branch filters are OR alternatives within the label
  dimension.
- Different dimensions combine with AND. For example, `category_keys=research`
  plus `label_path_prefixes=finance/bank` returns research items in that label
  branch.

`GET /api/labels`:

- `query`
- `include_inactive`
- `parent_id`
- `full_path_prefix`
- `limit`

`GET /api/categories`:

- `query`
- `applies_to_kind`
- `parent_key`
- `full_path_prefix`
- `include_inactive`
- `limit`
- `offset`

When `applies_to_kind` is provided, the result includes both categories for
that exact item kind and global categories where `applies_to_kind` is `null`.

## Known API Gaps

- Explicit ACL rows are enforced across the main item, content, file, project,
  metadata, and link-reference paths, but legacy items with no ACL rows still
  fall back to authenticated-user visibility until a migration/backfill exists.
- Saved queries are intentionally local-only in the frontend for now; the
  `saved_queries` table is reserved future storage.
- Frontend `403` handling still needs follow-up UX work.

## Error Behavior

- validation or domain errors: `400`
- missing/invalid authentication: `401`
- missing authorization: `403`
- stale write precondition: `409`
- successful reads/writes: usually `200`
- successful logout: `204`
