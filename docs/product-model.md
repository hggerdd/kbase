# Product Model

`kbase` is a personal/family knowledge base for notes, files, documents,
projects, and later automation. It should remain useful for a human in the
browser and for agents/tools through stable capabilities.

## Implemented Product Areas

- Notes: create, edit, autosave, label, categorize, search, view history.
- Note links: connect one note to other notes or file-backed items through
  explicit item links.
- Files: upload/import file-backed items, browse file tree, inspect metadata and
  stored content, and preview PDFs plus linked note image/PDF files.
- Search: global and scoped search over content and metadata filters.
- Projects: create project contexts and attach/list items.
- Project membership: assign or replace the project context a note belongs to.
- Imports: list inbox files and import them as items.
- Labels: hierarchical label nodes with create/update/deactivate/reactivate,
  explicit hard-delete cleanup, and assignment flows.
- Categories: managed category taxonomy keys with optional parent/child
  hierarchy.
- Auth: browser session login, bearer-token creation through API, and CLI token
  bootstrap for local automation.

## Planned Product Areas

- Effective ACL and permission-aware UI.
- Server-backed saved searches.
- OCR, summaries, derived thumbnails, text previews, and broader preview
  coverage.
- Bulk import and export.
- Tasks and events.
- Measurements/time-series.
- MCP/agent adapter over existing capabilities.

## Key Concepts

Item:

- The central object.
- Has kind, category, status, title, optional parent, creator, timestamps, and
  archive state.

Content part:

- Textual or markdown body attached to an item.
- Versioned when replaced.

File:

- Original stored file attached to a file-backed item.
- Stored in `kb/items/`, referenced by DB row.

Label:

- Hierarchical node such as `finance/income/2026`.
- Full path is search/filter surface.
- Deactivate/reactivate is the normal lifecycle path.
- Hard delete is allowed as explicit irreversible subtree cleanup.

Category:

- Stable reference key such as `research`, `income_document`, or
  `project_general`.
- Applies to an item kind when configured.
- If no item kind is configured, it applies to all item kinds and is shown in
  kind-specific pickers.
- Can have a compatible parent category; `full_path` is generated from the
  parent chain. A global parent can contain kind-specific children, but a
  kind-specific parent cannot contain global or different-kind children.
- Items store the exact primary `category_key`; branch filtering is an API/UI
  convenience over category `full_path` prefixes.
- Use labels for flexible multi-label hierarchy; use categories for one primary
  item classification.

Default note category roots:

- `capture`: quick notes, meeting notes, observations, inbox notes.
- `thinking`: research, comparison, analysis, decisions.
- `knowledge`: references, learning notes, processes, how-to material.
- `planning`: plans, ideas, review notes, follow-up notes.

Project:

- A project is an item of kind `project`.
- Membership lives in `project_items`.
- A note may be moved between projects by replacing its project membership set.

Item link:

- A relation from one item to another item.
- Used by notes to make explicit relationships to other notes and file-backed
  items.
- The current notes UI supports adding note links and image/PDF file links.
- The current notes UI supports removing existing note and file links.

Principal:

- Identity subject for audit, ownership, group membership, and ACL.
- Users map to principals after authentication.

## Product Constraints

- Browser identity is never trusted as a raw principal id.
- Agents should use capabilities, not direct table writes.
- Stored files and relational metadata must stay linked through explicit rows.
- Stored file MIME types are preview/download hints. They are normalized by the
  API and must not be treated as proof that file bytes are safe.
- Generated/derived data must stay distinguishable from canonical user/source
  data through provenance and metadata.
- Note content editing uses optimistic conflict detection. A save can include
  the loaded content timestamp; stale saves are rejected instead of silently
  overwriting newer content.

## Label Lifecycle

Labels are stable taxonomy nodes. Normal organization should prefer inactive
states over deletion so historical item context remains understandable.

Create:

- Creates one active label node.
- A child label is scoped by its parent and gets a generated `full_path`.
- Creating or assigning a path may create missing active ancestor nodes.

Rename:

- Changes the label name.
- Recomputes `full_path` for the renamed node and its subtree.
- Keeps existing item assignments attached to the same label ids.

Deactivate:

- Marks the selected label inactive.
- Keeps the label row, subtree, and item assignments.
- Inactive labels are hidden from normal label listing unless
  `include_inactive=true`.
- Existing items may still display inactive labels when their assigned labels
  are loaded.
- Normal create/assignment/search UI should avoid offering inactive labels as
  new choices.

Reactivate:

- Marks the selected inactive label active again.
- Does not automatically reactivate ancestors or descendants beyond the selected
  node.
- Restores the label to normal listings when active filters are used.

Delete:

- Hard delete is allowed as an explicit cleanup operation.
- Delete removes the selected label and its full subtree.
- Item assignments to every deleted label in that subtree are removed.
- Delete is irreversible and should be presented separately from deactivate in
  UI wording.

Search behavior:

- Exact label search uses active label paths for normal user-facing filters.
- Subtree/prefix search matches descendants by `full_path` prefix.
- Inactive labels are not returned by label picker/list calls unless requested
  with `include_inactive=true`.
- Category search filters use exact `category_keys` or subtree
  `category_path_prefixes`.
- Multiple values inside one filter dimension are alternatives; different
  dimensions combine to narrow results.

Saved search decision:

- Current search history is local to the browser.
- There is no server-backed saved-query workflow yet.
- The database `saved_queries` table is reserved for future synchronized saved
  searches.
