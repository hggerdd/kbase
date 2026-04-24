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
- Labels: hierarchical label nodes with create/update/deactivate/reactivate and
  assignment flows.
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
- Lifecycle decision for hard delete vs deactivate is still open.

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
