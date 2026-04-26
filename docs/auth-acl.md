# Auth And ACL

Status: current as of 2026-04-26.

This document describes identity, trust boundaries, and the unfinished ACL path.
Backlog IDs: `SEC-001`, `SEC-002`, `SEC-004`, `SEC-006`.

## Current State

Implemented:

- HTTP endpoints authenticate through session cookie or bearer token.
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
- DB bootstrap creates dev users:
  - `heiko / heiko-local-dev`
  - `wife / wife-local-dev`

Not implemented or incomplete:

- Runtime ACL enforcement is not complete across all read/write capabilities.
- CLI commands still use local `--actor heiko` defaults.
- CLI has no token/session flow.
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

## CLI Gap

The CLI currently calls capabilities directly in-process and passes an
`ActorContext` built from `--actor`.

Current gap:

- Many commands default to `--actor heiko`.
- This is local development behavior, not the target security model.

Target:

- Add a CLI auth/token flow.
- Store tokens outside the repository.
- Remove the normal `--actor heiko` default.
- Keep explicit actor override only for tests, seed/admin operations, or a
  clearly named local-dev mode.

## ACL Target

Seeded permissions:

- `view`
- `edit`
- `manage`

Starting rules:

- New item creators receive at least `manage`.
- Group permissions are resolved through `principal_memberships`.
- No matching permission means access denied.
- Missing authentication returns `401`.
- Missing authorization returns `403`.

Capabilities that need enforcement:

- Item list/detail reads.
- Content reads and writes.
- Note creation/update.
- File upload/import/download.
- Project membership operations.
- Metadata/classification changes.
- Label/category mutations where they affect shared state.
- ACL read/write endpoints.

## Migration Path

1. Finish trust-boundary documentation for local, LAN, and production-like modes.
2. Implement CLI token/auth flow and remove normal actor defaults.
3. Add shared authorization service.
4. Wire authorization into critical capabilities.
5. Add contract/integration tests for `401` and `403`.
6. Add frontend expired-session and forbidden-state handling.

## Related Docs

- [api.md](api.md)
- [architecture.md](architecture.md)
- [capabilities.md](capabilities.md)
- [../todo.md](../todo.md)
