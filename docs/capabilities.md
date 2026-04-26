# Capabilities

Status: current as of 2026-04-24.

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
| User login | `login_user` | yes | no | yes | partial | CLI auth flow missing |
| User logout | `logout_user` | yes | no | yes | partial | CLI counterpart missing |
| Current session | `get_current_session` | yes | no | yes | partial | CLI counterpart missing |
| Create API token | `create_api_token` | yes | no | no | no | token creation is API-only |
| Create note | `create_note` | yes | yes | yes | yes | well mirrored |
| Get item detail | `get_item` | yes | yes | yes | yes | well mirrored |
| List items | `list_items` | yes | yes | yes | partial | explicit CLI contract test missing |
| Update item core | `update_item_core` | yes | yes | yes | partial | API/CLI contract tests should be stronger |
| Replace content part | `replace_content_part` | yes | yes | yes | yes | well mirrored |
| Search content | `search_content` | yes | yes | yes | yes | well mirrored |
| Assign labels | `assign_labels` | yes | yes | no | partial | frontend uses replace flow instead |
| Replace labels | `replace_labels` | yes | no | yes | yes | CLI command missing |
| List labels | `list_labels` | yes | yes | yes | yes | well mirrored |
| Create label | `create_label` | yes | yes | yes | partial | frontend settings tests missing |
| Rename/update label | `rename_label` / `update_label` | yes | yes | yes | partial | frontend settings tests missing |
| Deactivate label | `deactivate_label` | yes | yes | yes | partial | frontend settings tests missing |
| Reactivate label | `reactivate_label` | yes | yes | yes | partial | frontend settings tests missing |
| Delete label subtree | `delete_label` | yes | no | yes | partial | CLI command and frontend tests missing |
| List categories | `list_categories` | yes | yes | yes | yes | well mirrored |
| Create category | `create_category` | yes | yes | yes | partial | frontend settings tests missing |
| Update category | `update_category` | yes | yes | yes | partial | frontend settings tests missing |
| Classify item | `classify_item` | yes | yes | no | yes | no dedicated frontend management UI |
| Patch metadata | `patch_item_metadata` | yes | yes | no | yes | no frontend management UI |
| Register asset | `register_asset` | yes | yes | no | partial | frontend uses upload flows instead |
| Attach asset | `attach_asset_to_item` | yes | yes | no | partial | frontend uses upload flows instead |
| Import uploaded file | `import_file_as_item` | yes | yes | yes | yes | well mirrored |
| List inbox files | `list_inbox_files` | yes | yes | yes | partial | frontend imports tests missing |
| Import inbox file | `import_inbox_file` | yes | yes | yes | partial | frontend imports tests missing |
| Link items | `link_items` | yes | yes | no | partial | no frontend link manager |
| List related items | `list_related_items` | yes | yes | partial | yes | frontend consumes links indirectly |
| Create project | `create_project` | yes | yes | yes | yes | well mirrored |
| Add item to project | `add_item_to_project` | yes | yes | yes | partial | dedicated CLI contract test missing |
| List project items | `list_project_items` | yes | yes | yes | partial | dedicated CLI contract test missing |
| Get item history | `get_item_history` | yes | yes | yes | partial | API/CLI contract tests missing |
| Get item provenance | `get_item_provenance` | yes | yes | no | partial | no frontend surface; contract tests missing |
| Get item ACL | `get_item_acl` | yes | no | no | no | API-only and not tested |
| Replace item ACL | `replace_item_acl` | yes | no | no | no | API-only and not tested |

## Highest-Value Gaps

1. `SEC-006`: replace CLI `--actor heiko` default with a real local token/auth
   flow.
2. `SEC-002`: implement shared ACL enforcement.
3. `FE-001`: add Settings/Labels and Settings/Categories frontend tests.
4. Add contract tests for project commands, history, provenance, and ACL.

## Rule For New Work

When adding a capability:

1. Add or extend the application capability.
2. Decide which interfaces should expose it.
3. Update this matrix.
4. Add tests at the right level.
5. Add or update a `todo.md` task if any interface is intentionally missing.
