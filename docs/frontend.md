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
  - Projects

Implemented app concerns:

- Session bootstrap through `GET /api/auth/session`.
- Login/logout through `/api/auth/login` and `/api/auth/logout`.
- Hash-based navigation via `frontend/src/app/navigation/nav-config.js`.
- Reduced primary navigation: Home, Search, Files, Imports, plus a reachable
  Settings entry from the desktop app rail and the mobile bottom navigation.
- Home is the primary notes workspace and reuses the existing notes capability
  flow instead of a separate dashboard.
- Search state lives in the dedicated Search page. The shared app header no
  longer renders a global search form.
- Shared API client with `credentials: "include"` in
  `frontend/src/shared/api/client.js`.
- File upload progress through `XMLHttpRequest` in the shared API client.
- Notes autosave uses optimistic content locking. A stale content timestamp
  from another editor returns `409` and leaves the workspace in a conflict
  state for the user to reload or reconcile.
- Home note filters use existing capabilities and endpoints for note search,
  category subtree scoping, project scoping, and label subtree scoping.
- Home metadata filters now use denser bounded panels. Category, project, and
  label lists scroll inside their own regions, and category/label trees expose
  compact expand-all and collapse-all controls.
- On phone-width screens, Home keeps search visible in the dark workspace area
  and moves category / project / label filters behind the same Advanced modal
  pattern used by Files.
- The notes results column now has a clickable sort chip with `Recent (last changed)`,
  `Alphabetical`, and `Created on` ordering for the visible note list.
- The Home notes sort selection is now saved through the backend user-preferences
  capability under `notes.home.sort_order` and restored as the initial order
  when the page opens again.
- Notes can change their project membership from the note header through
  `PUT /api/items/{item_id}/projects`.
- Notes can link other notes and file-backed items through `POST /api/links`.
  Linked notes open in a modal, and linked images/PDFs open in a file preview
  modal. Existing linked items can be unlinked from the same panel.
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
- Derived thumbnail/PDF preview generation pipeline.
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
frontend/src/App.jsx                          session bootstrap and routing
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
- `PUT /api/items/{item_id}/projects`
- `POST /api/links`
- `DELETE /api/links/{link_id}`

Home/notes workspace behavior:

- The `home` route is the main notes workspace.
- The legacy `notes` route renders the same workspace for compatibility.
- Home search is note-scoped by default when navigation forwards into the
  Search page.
- Category filters render the managed category tree. Selecting a parent category
  filters notes by `category_path_prefixes`, so descendant categories are
  included.
- Label filters use subtree/prefix semantics through label path prefixes.
- If a project is selected in Home, newly created notes keep that project scope.
- The note editor exposes the current project under the title. Changing it
  replaces the note's project membership through the backend capability.
- The `Files and links` panel can add note links and image/PDF file-item links.
  Existing linked notes are clickable cards; image/PDF file links are clickable
  preview cards. Linked note and file-item cards expose an unlink action.

Search:

- `GET /api/search/content`

Search filter wording:

- Categories can be exact keys or branch filters, depending on UI surface.
- Home category branch filters use category `full_path` prefixes.
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
- `PATCH /api/items/{item_id}`
- `PUT /api/items/{item_id}/labels`
- `PUT /api/items/{item_id}/projects`
- `POST /api/links`
- `DELETE /api/links/{link_id}`
- `GET /api/items/{item_id}/files/{file_id}/content`
- `POST /api/file-items/upload`
- `GET /api/inbox/files`
- `POST /api/inbox/import`

Files workspace behavior:

- The Files page now uses the same workspace layout language as Home: filters
  on the left, a bounded file results column, and an item detail panel.
- File-backed entries are treated as normal items. The page can edit title,
  description text, category, labels, project membership, and item links for
  the selected file item.
- File item title and description text autosave after editing. Category,
  project, label, and link changes write immediately through their shared
  capabilities; there is no separate file-item save button.
- The Files detail panel reuses the same note-style category, project, and
  label pill controls and picker modals as the Home note editor, so item context
  editing has one shared interaction path.
- The Files results header has a round add action. It can upload a file or open
  a camera-oriented image input on mobile browsers.
- On phone-width screens, Files follows the Home mobile pattern: the dark
  workspace area only shows search plus an Advanced button, advanced category /
  project / label filters live in a modal, the file tree remains the main list,
  and tapping a file opens a compact detail modal with context pills, preview,
  description text, and item links.
- File filters include search text plus scrollable category, project, and label
  tree/list filters. The right detail panel is reserved for file preview and
  editing the selected file item's normal item fields. The previous implicit
  `test` label filter is gone.
- Files uploaded as note attachments inherit the note context through the
  backend capability. Category, project membership, and labels are copied on
  upload; exclusive attachment file items track later note context changes.

Preview behavior:

- The Files page renders PDFs in the preview frame and image files in the
  preview surface.
- The note link panel renders linked image and PDF file items in a modal. It
  loads the linked file item detail before building the content URL.
- Image thumbnails preserve aspect ratio with letterboxing instead of cropping.
- Unsupported linked file formats show a file card without a preview action.

Projects:

- `POST /api/projects`
- `POST /api/projects/{project_id}/items`
- `GET /api/projects/{project_id}/items`
- shared item/list/search endpoints

Settings/Projects:

- Settings exposes Projects alongside Labels and Categories.
- The standalone `projects` route still exists and is hash-reachable, but it is
  no longer part of the reduced primary navigation set.
- Settings/Labels, Settings/Categories, and Settings/Projects share the same
  two-pane workspace layout: a bounded list/tree panel on the left and a
  detail/edit panel on the right.
- Project deletion in settings archives the project from the active list; linked
  items remain.

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
- The label settings tree now shares the same bounded explorer/detail layout as
  Categories and Projects, including inline search in the header area.

Categories:

- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/{category_key}`

Settings/Categories wording:

- Categories are managed taxonomy keys with optional parents.
- Settings/Categories now edits categories directly through a hierarchical tree
  plus inline detail form instead of a flat list.
- Selecting a category keeps the current tree position while updating the
  detail editor for that node.
- The compact create action is an icon button in the page header, and the
  category tree has bounded internal scrolling plus expand/collapse-all
  controls.
- Settings/Categories now uses one delete modal for all category deletions. If
  the backend reports that the category is still in use, that same modal
  upgrades into a force-delete warning and requires an explicit checkbox before
  clearing the category from affected items and deleting it.
- Settings/Categories exposes parent selection and keeps child categories within
  a compatible `applies_to_kind` tree.
- "All item types" categories are global and appear in kind-specific pickers
  such as Notes alongside note-only categories.
- Home uses category branch filtering; other file/search surfaces that only
  have item summaries may still display the assigned exact `category_key`.

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
