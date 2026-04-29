# Auth And ACL

Status: current as of 2026-04-29.

This document describes identity, trust boundaries, the current ACL behavior,
and the remaining security gaps.
Backlog IDs: `SEC-001`, `SEC-002`, `SEC-004`, `SEC-006`.

## Current State

Implemented:

- HTTP endpoints authenticate through session cookie or bearer token.
- CLI normal commands authenticate through session token or bearer token
  resolved locally from root CLI flags or `KBASE_*` env vars.
- CLI bootstrap token creation exists:
  - `uv run kbase auth token-create --username <USER> --token-label <LABEL>`
- Browser login exists:
  - `POST /api/auth/login`
  - `GET /api/auth/session`
  - `POST /api/auth/logout`
- API token creation exists:
  - `POST /api/auth/tokens`
- The frontend bootstraps identity from `GET /api/auth/session`.
- Frontend requests use `credentials: "include"`.
- The schema contains `users`, `user_sessions`, `api_tokens`, `principals`,
  `principal_memberships`, and `item_acl`.
- Shared item authorization uses `view`, `edit`, and `manage`.
- Item detail/list/search, content writes, metadata writes, file
  upload/download, project membership operations, ACL endpoints, and related
  item/project references run through the same item-permission checks.
- DB bootstrap creates dev users:
  - `heiko / heiko-local-dev`
  - `wife / wife-local-dev`

Not implemented or incomplete:

- Existing items with no explicit ACL rows still fall back to
  authenticated-user visibility as a bootstrap compatibility rule.
- Label/category administration is authenticated but not separately admin-scoped.
- Frontend does not yet have complete ACL-aware UI states for `403` responses.

## Trust Boundary

Browser:

- Can send credentials and session cookies.
- Can display session state.
- Must not choose `principal_id`.
- Must not make authorization decisions.

API client:

- Authenticates with `Authorization: Bearer <TOKEN>`.
- May run from scripts, CLI replacement flows, automation, or external tools.
- Must receive tokens from an authenticated user flow.
- Must protect raw tokens outside the repository and runtime data folders.

Backend:

- Owns login validation.
- Owns session and token validation.
- Maps authenticated users to principals.
- Must make ACL decisions.

LAN:

- Is not trusted for identity.
- LAN clients still need a valid session or bearer token.
- Allowed browser origins must be explicit through `KBASE_CORS_ORIGINS`.

## Runtime Trust Modes

Local development:

- Intended for one developer on the same machine.
- Browser identity is still the `kbase_session` cookie from
  `POST /api/auth/login`.
- API-client identity is still `Authorization: Bearer <TOKEN>`.
- Default CORS origins are development-only Vite origins on localhost and
  `127.0.0.1`.
- The default API trust mode is `KBASE_TRUST_MODE=local`.
- The seeded dev users are convenience accounts, not a LAN trust mechanism.

LAN development:

- Intended for testing from other devices on the same private network.
- The network location does not prove identity.
- Every browser still needs a valid server-side session cookie.
- Every non-browser API client still needs a bearer token.
- Set `KBASE_CORS_ORIGINS` to the exact LAN frontend origins that should be
  allowed to send credentialed browser requests.
- Use `KBASE_TRUST_MODE=lan` so missing CORS configuration fails closed.

Production-like deployment:

- Serve the frontend and API through a controlled origin, normally the Nginx
  frontend with `/api` proxied to FastAPI.
- Configure `KBASE_CORS_ORIGINS` only when a separate browser origin is
  intentionally supported.
- `KBASE_TRUST_MODE=production` has no default CORS origins.
- Do not expose dev credentials as real accounts.
- Do not treat LAN, reverse-proxy headers, request IDs, or client-provided
  principal data as identity.

## Identity Model

User:

- Login account.
- Has username, password hash, active flag, and principal mapping.

Principal:

- Domain identity for ownership, audit, ACL, and group membership.
- Users map to personal principals.
- Groups are also principals.

Session:

- Browser-oriented authenticated state.
- Stored server-side as `user_sessions`.
- Sent to browser as `kbase_session`.

API token:

- API/automation credential.
- Stored hashed in `api_tokens`.
- Raw secret is returned only once.

## HTTP Auth Rules

Supported identity mechanisms:

- Session cookie `kbase_session`.
- `Authorization: Bearer <TOKEN>`.

Unsupported identity mechanisms:

- `x-kbase-actor`.
- Anonymous access to domain endpoints.
- Client-selected principal IDs.

`x-kbase-request-id` may be used for request correlation only. It is not an
identity mechanism.

## CLI Flow

The CLI still calls capabilities in-process, but normal commands no longer
invent an actor locally.

Normal CLI identity:

- `uv run kbase --api-token <TOKEN> ...`
- `uv run kbase --session-token <SESSION> ...`
- `KBASE_API_TOKEN` or `KBASE_SESSION_TOKEN`

Bootstrap token flow:

1. Create a CLI token:
   `uv run kbase auth token-create --username heiko --token-label cli-dev --json`
2. Export the returned secret into `KBASE_API_TOKEN`.
3. Run normal CLI commands without `--actor`.

Compatibility-only local actor mode:

- `--actor` is still available for explicit local-dev/test usage.
- It is disabled by default.
- Re-enable it only with `--allow-local-actor`.

## ACL Behavior

Seeded permissions:

- `view`
- `edit`
- `manage`

Current rules:

- New item creators receive `view`, `edit`, and `manage`.
- Group permissions are resolved through `principal_memberships`.
- No matching permission means access denied.
- Missing authentication returns `401`.
- Missing authorization returns `403`.
- Items with no ACL rows remain visible to authenticated users until an
  explicit ACL is written for that item.

Protected paths:

- Item list/detail/search reads.
- Content reads and writes.
- Note creation/update and item metadata/classification writes.
- File upload/import/download.
- Project membership operations.
- Related item/project references returned from item detail and link lookups.
- Item label mutations and ACL read/write endpoints.

## Risk Coverage

Current contract coverage added for `TEST-001`:

- anonymous domain access returns `401`
- bearer-token access works for non-browser clients
- ACL-denied item detail returns `403`
- ACL-denied note edits, label replacement, and attachment upload return `403`
- ACL-denied file download returns `403`
- ACL filters item list/search visibility and project item access
- item detail hides related items, outgoing links, and project refs that the
  caller cannot read
- CLI commands require token/session auth by default and gate `--actor` behind
  `--allow-local-actor`

## Follow-Up

1. Decide whether to migrate or backfill legacy rows that still have no ACL.
2. Scope label/category administration more narrowly if multiple trusted users
   should not share global taxonomy writes.
3. Add frontend expired-session and forbidden-state handling.

## Related Docs

- [api.md](api.md)
- [architecture.md](architecture.md)
- [capabilities.md](capabilities.md)
- [../todo.md](../todo.md)
