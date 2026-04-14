# Label Management Plan

## Goal

Labels need to evolve from plain path-like strings into first-class hierarchical entities.
The target model must preserve the current lightweight item assignment flow while adding:

- stable label identities
- real parent/child hierarchy
- subtree-aware rename and deactivate flows
- search and filtering by individual hierarchy levels
- one shared capability core reused by API, CLI, and frontend

This plan is aligned with the existing architecture:

- capability layer owns business rules
- repositories own persistence details
- API and CLI mirror the same capability surface
- frontend consumes the same label model everywhere

## Product Principles

1. Labels are entities, not just decorated strings.
2. A label path must remain globally unique.
3. Child labels are semantically scoped by their parent.
4. Rename and deactivate must be safe for already linked items.
5. The model must stay usable for quick tagging in notes, files, search, and future project flows.

## Current State

Today the system already supports:

- listing labels
- attaching labels to items
- replacing labels on items

What is missing:

- explicit label lifecycle management
- stable label identities for hierarchy operations
- subtree-aware rename semantics
- deactivation/reactivation
- label management UI
- CLI and API parity for administration

## Proposed Domain Model

Labels become hierarchical nodes with stable ids.

Suggested fields:

- `id`
- `name`
- `parent_id`
- `full_path`
- `depth`
- `active`
- `meta`
- `created_at`
- `updated_at`

Important constraints:

- `full_path` is globally unique
- siblings cannot share the same `name`
- `parent_id = null` means root label
- `depth` is derived but can be materialized for efficient querying
- `active = false` hides a label from normal creation/search flows but preserves referential integrity

## Item Assignment Model

Keep item assignment conceptually simple:

- `item_labels` should reference `label_id`
- path rendering is derived from the label entity

This is the key design choice that keeps rename manageable.
If item assignments only store label ids, rename propagation updates label nodes rather than rewriting every item assignment row.

## Hierarchy Semantics

Examples:

- `finance`
- `finance/income`
- `finance/income/data`
- `finance/bank`
- `finance/bank/depot`
- `finance/bank/depot/data`

`data` under `finance/income` is not the same node as `data` under `finance/bank/depot`.
That distinction comes from parent-child identity, not only from string prefix matching.

## Lifecycle Rules

### Create

- create by `parent_id + name` or by full path input
- missing ancestors may be created explicitly or rejected; MVP should prefer explicitness to avoid silent taxonomy drift

### Rename

- rename changes the node name
- subtree `full_path` values are recomputed
- child nodes stay attached to the renamed parent
- label ids remain stable

Example:

- `finance/investing` -> `finance/assets`
- subtree:
  - `finance/investing/etf` -> `finance/assets/etf`

### Deactivate

- default lifecycle action instead of hard delete
- inactive labels cannot be newly assigned in normal UI flows
- existing assignments remain visible and resolvable

### Reactivate

- restores a previously deactivated node
- allowed only if the target path does not collide with another active node

### Delete

Not recommended for MVP.

If ever introduced, it should be restricted to labels with:

- no children
- no item assignments

## Capability Surface

New or expanded capabilities:

- `create_label`
- `list_labels`
- `rename_label`
- `deactivate_label`
- `reactivate_label`
- optional later: `merge_labels`

Capability responsibilities:

- validate hierarchy rules
- prevent path collisions
- propagate subtree path updates on rename
- enforce deactivate/reactivate rules
- return DTOs reusable by API and CLI

## Repository Requirements

Repository layer should support:

- fetch by id
- fetch by full path
- list tree / list flat / search labels
- create node
- rename node
- bulk update subtree paths
- deactivate/reactivate node
- count or list item references per label

Rename and deactivate operations should be transactional.

## API Shape

Required endpoints:

- `POST /api/labels`
- `GET /api/labels`
- `PATCH /api/labels/{id}`
- `POST /api/labels/{id}/deactivate`

Recommended additions for completeness:

- `POST /api/labels/{id}/reactivate`
- `GET /api/labels/tree`

## CLI Mirror

CLI should remain a thin surface over capabilities:

- `kbase label create`
- `kbase label list`
- `kbase label rename`
- `kbase label deactivate`
- `kbase label reactivate`

The CLI should support both:

- human-readable paths
- explicit ids for scripting

## Frontend Impact

Frontend work is not just a management page.
The label model must become reusable across the app:

- note creation/editing
- file import flows
- search filters
- future project item operations

### Shared UI Requirement

Create one reusable label modal family:

- create label
- rename label
- deactivate label

This shared modal should be invokable from multiple contexts so users can manage taxonomy inline without leaving their current workflow.

### Search and Filtering

Search/filter behavior must support:

- filtering by exact node
- filtering by subtree
- filtering by depth/branch where useful

This is stronger than string prefix matching and depends on the hierarchical model.

## Migration Strategy

Migration must:

1. create the new label entity structure
2. backfill existing labels into nodes with stable ids
3. reconnect `item_labels` to label ids
4. preserve current full paths
5. provide rollback

Sample data should include:

- multi-level branches
- duplicate leaf names under different parents
- inactive nodes

## Suggested Delivery Order

1. finalize lifecycle rules and rename/deactivate semantics
2. add DB schema and migration
3. implement repository support
4. implement capability layer
5. expose API
6. mirror in CLI
7. refactor existing label consumers to the new model
8. add frontend management UI and shared modals
9. add tests and fixtures for label flows

## Risks

- mixing path strings and label ids during transition
- accidental rename collisions in subtrees
- incomplete handling of inactive labels in search/filter UIs
- frontend assumptions that labels are still plain strings

## MVP Exit Criteria

The MVP is done when:

- labels exist as hierarchical entities with stable ids
- rename propagates safely through subtree paths
- deactivate/reactivate works without breaking item references
- API and CLI expose the same operations
- frontend can search, create, rename, and deactivate labels
- shared label modals are reusable across contexts
