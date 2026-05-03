# Capabilities

Status: current as of 2026-05-03.

This matrix shows whether each application capability is visible through API,
CLI, frontend, and tests. Use it before adding new behavior to avoid creating
one-interface-only features.

Legend:

- `yes`: visible and actively used.
- `partial`: present indirectly or only partly tested.
- `no`: not currently exposed.

## Matrix

| Capability | Application function | API | CLI | Frontend | Tests | Gap |
| --- | --- | --- | --- | --- | --- | --- |
| User login | `login_user` | yes | no | yes | partial | CLI bootstrap still uses separate token-create flow |
| User logout | `logout_user` | yes | no | yes | partial | CLI counterpart missing |
| Current session | `get_current_session` | yes | partial | yes | partial | used indirectly by CLI root auth, not exposed as a direct command |
| Create API token | `create_api_token` | yes | no | no | partial | session-authenticated token create is still API-only |
| Bootstrap CLI token | `create_api_token_with_password_flow` | no | yes | no | yes | local CLI bootstrap helper only |
| Create note | `create_note` | yes | yes | yes | yes | well mirrored |
| Get item detail | `get_item` | yes | yes | yes | yes | well mirrored |
| List items | `list_items` | yes | yes | yes | yes | well mirrored |
| Update item core | `update_item_core` | yes | yes | yes | partial | API/CLI contract tests should be stronger |
| Replace content part | `replace_content_part` | yes | yes | yes | yes | well mirrored |
| Search content | `search_content` | yes | yes | yes | yes | well mirrored |
| Assign labels | `assign_labels` | yes | yes | no | partial | frontend uses replace flow instead |
| Replace labels | `replace_labels` | yes | no | yes | yes | CLI command missing |
| List labels | `list_labels` | yes | yes | yes | yes | well mirrored |
| Create label | `create_label` | yes | yes | yes | yes | well mirrored |
| Rename/update label | `rename_label` / `update_label` | yes | yes | yes | yes | well mirrored |
| Deactivate label | `deactivate_label` | yes | yes | yes | yes | well mirrored |
| Reactivate label | `reactivate_label` | yes | yes | yes | yes | well mirrored |
| Delete label subtree | `delete_label` | yes | yes | yes | yes | well mirrored |
| List categories | `list_categories` | yes | yes | yes | yes | well mirrored |
| Create category | `create_category` | yes | yes | yes | yes | well mirrored |
| Update category | `update_category` | yes | yes | yes | yes | well mirrored |
| Delete category | `delete_category` | yes | yes | yes | yes | blocked when category is still referenced or has children |
| Classify item | `classify_item` | yes | yes | no | yes | no dedicated frontend management UI |
| Patch metadata | `patch_item_metadata` | yes | yes | no | yes | no frontend management UI |
| Register asset | `register_asset` | yes | yes | no | partial | frontend uses upload flows instead |
| Attach asset | `attach_asset_to_item` | yes | yes | no | partial | frontend uses upload flows instead |
| Import uploaded file | `import_file_as_item` | yes | yes | yes | yes | well mirrored |
| List inbox files | `list_inbox_files` | yes | yes | yes | partial | frontend imports tests missing |
| Import inbox file | `import_inbox_file` | yes | yes | yes | partial | frontend imports tests missing |
| Link items | `link_items` | yes | yes | yes | partial | frontend supports note and image/PDF linking from notes |
| Unlink items | `unlink_items` | yes | no | yes | yes | CLI command missing |
| List related items | `list_related_items` | yes | yes | yes | yes | frontend consumes item detail links in the notes workspace |
| Create project | `create_project` | yes | yes | yes | yes | well mirrored |
| Add item to project | `add_item_to_project` | yes | yes | yes | partial | dedicated CLI contract test missing |
| Replace item projects | `replace_item_projects` | yes | no | yes | yes | CLI command missing; currently used by note project picker |
| List project items | `list_project_items` | yes | yes | yes | partial | dedicated CLI contract test missing |
| Get item history | `get_item_history` | yes | yes | yes | partial | API/CLI contract tests missing |
| Get item provenance | `get_item_provenance` | yes | yes | no | partial | no frontend surface; contract tests missing |
| Get item ACL | `get_item_acl` | yes | no | no | no | API-only and not tested |
| Replace item ACL | `replace_item_acl` | yes | no | no | no | API-only and not tested |

## Highest-Value Gaps

1. `TEST-001`: keep expanding risk-driven auth/ACL/XSS/search/file coverage.
2. Backfill or migrate legacy items that still have no explicit ACL rows.
3. Add focused UI tests for note link cards, linked note modals, and image/PDF
   previews.
4. Add contract tests for project commands, history, provenance, and ACL.

## Rule For New Work

When adding a capability:

1. Add or extend the application capability.
2. Decide which interfaces should expose it.
3. Update this matrix.
4. Add tests at the right level.
5. Add or update a `todo.md` task if any interface is intentionally missing.
