# Frontend App

This document describes the current React/Vite web client in `frontend/`.

The frontend is a same-origin browser client for the FastAPI backend. It does
not contain domain rules; it calls HTTP endpoints that map to the shared
application capabilities.

Identity comes from the backend. The browser uses the `kbase_session` cookie
created by `POST /api/auth/login`, refreshes identity through
`GET /api/auth/session`, and never selects a principal directly.

## Current Shape

Implemented pages:

- Home
- Search
- Files
- Projects
- Imports
- Settings
  - Labels
  - Categories

Implemented app concerns:

- Session bootstrap through `GET /api/auth/session`.
- Login/logout through `/api/auth/login` and `/api/auth/logout`.
- Hash-based navigation via `frontend/src/app/navigation/nav-config.js`.
- Reduced primary navigation: Home, Search, Files, Imports, plus a reachable
  Settings entry from the app rail.
- Home is the primary notes workspace and reuses the existing notes capability
  flow instead of a separate dashboard.
- Global search state in `App.jsx` with page-scoped default behavior.
- Shared API client with `credentials: "include"` in
  `frontend/src/shared/api/client.js`.
- File upload progress through `XMLHttpRequest` in the shared API client.
- Notes autosave uses optimistic content locking. A stale content timestamp
  from another editor returns `409` and leaves the workspace in a conflict
  state for the user to reload or reconcile.
- Home note filters use existing capabilities and endpoints for note search,
  category scoping, project scoping, and label subtree scoping.
- The top-right app chrome shows the deployment label, Git branch, short commit,
  and commit date from Vite build metadata.
- Plain CSS styling in `frontend/src/styles.css`.
- Shared rich-content sanitization in `frontend/src/shared/utils/rich-content.js`
  for stored markdown/html render paths.

Not implemented or incomplete:

- Full ACL-aware UI states.
- CLI/token account flow in the frontend.
- Dedicated management UIs for metadata, provenance, and ACL.
- OCR/preview generation pipeline.
- Broad browser/E2E smoke coverage.

Search history:

- Search history is stored in browser `localStorage` under
  `kbase.search.history`.
- There is no server-backed saved-query UI or API contract yet.
- Clearing browser storage clears this history for that browser only.

## Runtime

Development:

```powershell
cd frontend
npm install
npm run dev
```

Build:

```powershell
cd frontend
npm run build
```

In Docker development, Vite proxies `/api` and `/health` to the API. In Docker
production, Nginx provides the same routing. The frontend therefore uses
same-origin requests by default.

Optional override:

```powershell
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000"
npm run dev
```

Build/version metadata:

- Local Vite runs read `.git` when it is available.
- Docker development mounts `.git` read-only so the visible badge reflects the
  current branch and commit while testing.
- Production-like Docker builds can pass `VITE_KBASE_DEPLOYMENT_LABEL`,
  `VITE_KBASE_GIT_BRANCH`, `VITE_KBASE_GIT_COMMIT`, and
  `VITE_KBASE_GIT_COMMIT_DATE` as build arguments.

There is no supported `VITE_KBASE_ACTOR` flow anymore. Identity comes from the
server-side session.

LAN usage:

- LAN is not trusted for identity.
- A browser opened from another LAN device still needs a valid backend session
  cookie.
- If the frontend is served from a different LAN origin than the API, that exact
  origin must be allowed through `KBASE_CORS_ORIGINS`.
- `KBASE_TRUST_MODE=lan` and `KBASE_TRUST_MODE=production` do not add default
  browser CORS origins; same-origin proxying remains preferred.
- Bearer tokens are for API clients and automation, not for frontend state.

## Important Files

```text
frontend/src/main.jsx                         React entry point
frontend/src/App.jsx                          session bootstrap, routing, global search
frontend/src/app/AppShell.jsx                 shared app frame and navigation
frontend/src/app/navigation/nav-config.js     route definitions
frontend/src/shared/api/client.js             fetch/XHR wrapper
frontend/src/features/*/api.js                endpoint wrappers per feature
frontend/src/features/*/hooks.js              data loading and mutations
frontend/src/features/*/state.js              feature state helpers
frontend/src/pages/*                          page-level UI
frontend/src/shared/ui/*                      reusable UI primitives
frontend/src/styles.css                       global styling
```

## API Usage By Area

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

Notes:

- `GET /api/items?item_kind=note`
- `GET /api/items/{item_id}`
- `POST /api/notes`
- `PATCH /api/items/{item_id}`
- `PUT /api/items/{item_id}/content`
- `GET /api/items/{item_id}/history`
- `PUT /api/items/{item_id}/labels`

Home/notes workspace behavior:

- The `home` route is the main notes workspace.
- The legacy `notes` route renders the same workspace for compatibility.
- Home search is note-scoped by default when the global search flow forwards
  into the Search page.
- Category filters remain flat keys; the home UI must not imply category
  hierarchy semantics that the backend does not support.
- Label filters use subtree/prefix semantics through label path prefixes.
- If a project is selected in Home, newly created notes keep that project scope.

Search:

- `GET /api/search/content`

Search filter wording:

- Categories are exact category keys.
- Exact labels are exact full label paths.
- Label branches are subtree/prefix filters that include the selected path and
  its descendants.
- Multiple entries in one field are alternatives; different filter fields narrow
  the result together.

Rich content:

- Notes and file summaries render stored markdown through the same sanitization
  helper before HTML reaches editors or preview surfaces.
- Script tags, event-handler attributes, unsafe `javascript:` URLs, and embedded
  active content are removed from rendered rich content.

Files and imports:

- `GET /api/items?item_kind=document|image|spreadsheet|summary`
- `GET /api/items/{item_id}`
- `GET /api/items/{item_id}/files/{file_id}/content`
- `POST /api/file-items/upload`
- `GET /api/inbox/files`
- `POST /api/inbox/import`

Projects:

- `POST /api/projects`
- `POST /api/projects/{project_id}/items`
- `GET /api/projects/{project_id}/items`
- shared item/list/search endpoints

Labels:

- `GET /api/labels`
- `POST /api/labels`
- `PATCH /api/labels/{label_id}`
- `DELETE /api/labels/{label_id}`
- `POST /api/labels/{label_id}/deactivate`
- `POST /api/labels/{label_id}/reactivate`

Settings/Labels lifecycle wording:

- Deactivate/reactivate are the normal lifecycle actions.
- Hard delete is presented as irreversible subtree cleanup.
- The page can include inactive labels so they can be inspected and reactivated.

Categories:

- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/{category_key}`

Settings/Categories wording:

- Categories are flat keys.
- The UI must not present category parents, trees, or subcategories.
- Category filtering may match key prefixes as string filtering, but those
  prefixes are not hierarchy semantics.

## Feature Modules

The frontend follows a feature-slice structure:

```text
features/<area>/api.js      HTTP wrapper for that area
features/<area>/hooks.js    React hooks and orchestration
features/<area>/state.js    pure helpers and transformations
pages/<area>/               page and component UI
```

Prefer adding a small feature module or extending an existing one over placing
new backend calls directly in page components.

## Tests

Current frontend tests are Node-based and intentionally focused:

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

Coverage gaps are tracked in [../todo.md](../todo.md), especially imports tests
and full browser smoke tests.
