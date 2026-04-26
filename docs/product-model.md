# Product Model

`kbase` is a personal/family knowledge base for notes, files, documents,
projects, and later automation. It should remain useful for a human in the
browser and for agents/tools through stable capabilities.

## Implemented Product Areas

- Notes: create, edit, autosave, label, categorize, search, view history.
- Files: upload/import file-backed items, browse file tree, inspect metadata and
  stored content.
- Search: global and scoped search over content and metadata filters.
- Projects: create project contexts and attach/list items.
- Imports: list inbox files and import them as items.
- Labels: hierarchical label nodes with create/update/deactivate/reactivate,
  explicit hard-delete cleanup, and assignment flows.
- Categories: flat category keys managed through API/frontend settings.
- Auth: browser session login and bearer-token creation through API.

## Planned Product Areas

- Effective ACL and permission-aware UI.
- CLI auth/token flow.
- Server-backed saved searches.
- OCR, summaries, thumbnails, PDF/image/text previews.
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

- Flat reference key such as `research`, `income_document`, or
  `project_general`.
- Applies to an item kind when configured.
- Whether categories should become hierarchical is open as `CAT-001`.

Project:

- A project is an item of kind `project`.
- Membership lives in `project_items`.

Principal:

- Identity subject for audit, ownership, group membership, and ACL.
- Users map to principals after authentication.

## Product Constraints

- Browser identity is never trusted as a raw principal id.
- Agents should use capabilities, not direct table writes.
- Stored files and relational metadata must stay linked through explicit rows.
- Generated/derived data must stay distinguishable from canonical user/source
  data through provenance and metadata.

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
