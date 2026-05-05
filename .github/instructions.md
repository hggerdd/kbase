# Project Instructions

This repository is an AI-led, capability-first knowledge-base project. Prefer
small, verifiable changes that keep code, docs, and TODOs aligned.

## Runtime Rules

- Use `uv` for Python dependency and command execution.
- Prefer `uv run ...` over direct `python ...`.
- Use `uv sync --extra dev` before local Python test work when dependencies may
  be missing.
- Run Python tests with `uv run --extra dev pytest -q`.
- Run the API with `uv run uvicorn kbase.interfaces.api.main:app --reload`.
- Run CLI commands with `uv run kbase ...` or
  `uv run python -m kbase.interfaces.cli.main ...`.

Frontend commands run from `frontend/`:

```powershell
npm install
npm run build
npm run test:layout
npm run test:files
npm run test:files:ui
npm run test:notes
npm run test:settings
npm run test:search
```

## Branch Workflow Rules

- Every new feature, cleanup, fix, or documentation project must happen on its
  own feature branch created from current `dev`.
- Do not continue unrelated work on an existing feature branch.
- Before starting work, check the current branch and worktree status.
- If the current branch already contains another feature, stop and ask the user
  whether to:
  - commit the current branch, merge it into `dev`, then create a new feature
    branch from `dev`; or
  - continue because the requested work is actually part of the current feature.
- If that distinction is unclear, keep asking until it is clear. Do not guess and
  do not mix unrelated features in one branch.
- Uncommitted unrelated files must stay out of the new work. Either leave them
  untouched, ask the user how to handle them, or use a clearly scoped stash when
  branch switching requires it.

## Architecture Rules

- Keep domain rules in `src/kbase/core/`.
- Keep use-case behavior in `src/kbase/application/capabilities/`.
- Keep database, repository, auth, and filesystem details in
  `src/kbase/infrastructure/`.
- Keep FastAPI and Typer as adapters in `src/kbase/interfaces/`.
- Do not add business logic directly to API routes, CLI commands, or React pages
  when it belongs in a capability.
- A write capability is normally the transaction boundary.
- Audit/provenance should move with the write it describes.

## Auth And Identity

- HTTP identity is session-cookie or bearer-token based.
- Do not document or implement `x-kbase-actor` as a supported HTTP identity
  mechanism.
- CLI normal commands should resolve identity from session/token-based auth.
- Any retained `--actor` path must stay explicit, local-dev only, and must not
  become the default behavior again.
- New browser work should use `GET /api/auth/session` for identity context.

## Security Thinking

- Treat security as part of normal design work, not as a later hardening pass.
- Before changing API, CLI, file, project, search, label, category, or agent
  behavior, ask what the trust boundary is and which authenticated principal is
  allowed to read, write, or manage the target data.
- Prefer shared authorization checks in the capability/application boundary over
  adapter-local checks in FastAPI routes, CLI commands, or frontend code.
- Fail closed when identity or authorization is unclear. Do not add convenience
  paths that bypass session, token, ACL, upload-size, MIME, or path-safety
  controls.
- Preserve or improve audit/provenance when adding write paths.
- When existing behavior is intentionally permissive for bootstrap or local-dev
  reasons, document that explicitly in canonical docs and track the follow-up in
  `todo.md`.
- Add or update regression tests for authentication failure, authorization
  denial, and any security-sensitive file or content handling that the change
  touches.

## Documentation Rules

When behavior changes, update the canonical docs in the same change:

- `README.md`
- `docs/README.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/frontend.md`
- `docs/data-map.md`
- `docs/auth-acl.md`
- `todo.md`
- `docs/capabilities.md` when capability coverage changes

Use `todo.md` task IDs for follow-up work. Add new tasks with the same schema:

```text
TASK-ID | Status | Priority | Area | Title
Source:
Acceptance:
```

Historical docs in `docs/archive/` are background. Do not treat them as current
truth when they conflict with code.

After implementing a feature start/restart the docker dev version.

## Data Rules

- Schema source: `src/kbase/infrastructure/db/sql/001_schema.sql`.
- Seed reference source:
  `src/kbase/infrastructure/db/sql/002_seed_reference_data.sql`.
- Runtime file storage: `kb/items/`.
- Inbox import storage: `kb/inbox/`.
- Data-location overview: `docs/data-map.md`.

## Quality Bar

- Match existing naming and feature-slice structure.
- Add or update focused tests when touching shared behavior, security, API
  contracts, file handling, or frontend state.
- Keep docs readable for LLM continuation: explicit current state, explicit gaps,
  stable task IDs, and concrete command examples.
