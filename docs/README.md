# Documentation

This folder is the canonical documentation set for `kbase`.

## Rule

Use these files for current truth:

- [architecture.md](architecture.md): system architecture and boundaries.
- [data-map.md](data-map.md): where data, files, logs, schema, tests, and docs
  live.
- [api.md](api.md): HTTP API.
- [frontend.md](frontend.md): React/Vite app.
- [auth-acl.md](auth-acl.md): auth and ACL plan/current state.
- [capabilities.md](capabilities.md): capability coverage across API, CLI,
  frontend, and tests.
- [product-model.md](product-model.md): product/domain model and future scope.
- [../todo.md](../todo.md): backlog and follow-up tasks.
- [../README.md](../README.md): operational entrypoint.

Everything under [archive](archive/) is historical background. It may explain
why decisions were made, but it is not authoritative for current behavior.

## For LLM Agents

Read in this order:

1. [../README.md](../README.md)
2. [architecture.md](architecture.md)
3. [data-map.md](data-map.md)
4. [capabilities.md](capabilities.md)
5. [../todo.md](../todo.md)
6. Any focused doc needed for the task, such as [api.md](api.md),
   [frontend.md](frontend.md), or [auth-acl.md](auth-acl.md)

Then inspect the code. If docs and code conflict, trust the code and update the
docs in the same change.

## Maintenance Rules

- Do not add new root-level Markdown files unless they are project entrypoints
  like `README.md` or `todo.md`.
- Put current docs in `docs/`.
- Put historical/proposal/source material in `docs/archive/`.
- Prefer one strong canonical doc over several overlapping notes.
- Use stable task IDs from `todo.md` when documenting gaps.
- Keep filenames lowercase kebab-case.
