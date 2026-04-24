# API

Status: current as of 2026-04-24.

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
must not choose a principal.

Default development origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Set LAN/custom origins through `KBASE_CORS_ORIGINS`.

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
- `PATCH /api/items/{item_id}/metadata`
- `POST /api/items/{item_id}/classification`

Search:

- `GET /api/search/content`

Labels:

- `GET /api/labels`
- `POST /api/labels`
- `PATCH /api/labels/{label_id}`
- `DELETE /api/labels/{label_id}`
- `POST /api/labels/{label_id}/deactivate`
- `POST /api/labels/{label_id}/reactivate`
- `POST /api/items/{item_id}/labels`
- `PUT /api/items/{item_id}/labels`

Categories:

- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/{category_key}`

Files, assets, and inbox:

- `POST /api/assets`
- `POST /api/items/{item_id}/assets`
- `POST /api/items/{item_id}/attachments/upload`
- `POST /api/file-items/upload`
- `GET /api/items/{item_id}/files/{file_id}/content`
- `GET /api/inbox/files`
- `POST /api/inbox/import`

Links and projects:

- `POST /api/links`
- `GET /api/items/{item_id}/links`
- `POST /api/projects`
- `POST /api/projects/{project_id}/items`
- `GET /api/projects/{project_id}/items`

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

`GET /api/search/content`:

- `query`
- `item_kinds`
- `category_keys`
- `label_paths`
- `label_path_prefixes`
- `statuses`
- `created_by_principal_ids`
- `project_id`
- `include_archived`
- `limit`
- `offset`

`GET /api/labels`:

- `query`
- `include_inactive`
- `parent_id`
- `full_path_prefix`
- `limit`

`GET /api/categories`:

- `query`
- `applies_to_kind`
- `include_inactive`
- `limit`
- `offset`

## Known API Gaps

- ACL endpoints exist, but broad ACL enforcement is still `SEC-002`.
- Label hard-delete vs deactivate lifecycle is still `LAB-001`/`LAB-002`.
- Saved queries are not exposed as a server-backed capability.
- CLI auth is separate and incomplete as `SEC-006`.

## Error Behavior

- validation or domain errors: `400`
- missing/invalid authentication: `401`
- missing authorization: `403`
- successful reads/writes: usually `200`
- successful logout: `204`
