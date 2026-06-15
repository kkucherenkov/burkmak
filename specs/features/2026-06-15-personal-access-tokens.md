# Feature spec — Personal Access Tokens (shared enabler for P4 · P5)

- Status: draft
- Created: 2026-06-15
- Owner: claude
- PRD: [../PRD.md](../PRD.md) (§7 S4 device pairing, §7 S5 export — both need headless auth)
- Roadmap: [../roadmap.md](../roadmap.md) (enabler for P4 + P5)

## Goal

Give a user a **long-lived token** they generate once and paste into a headless
client — a Kobo's OPDS catalog setting, the Obsidian plugin — so those clients
authenticate without an expiring session cookie/bearer. Without this, neither
P4 (Kobo) nor P5 (Obsidian) is usable in practice; building it once unblocks
both.

At the end of this slice a user can: open Settings → create a named token →
copy the secret (shown once) → paste it into Kobo/Obsidian; list their tokens;
and revoke one. Every existing authenticated endpoint accepts a valid token
exactly as it accepts a session.

## Scope

**In:**

- Backend: a `PersonalAccessToken` model + create/list/revoke endpoints; guard
  extension so a valid token resolves `req.userId`.
- Web: a "Personal access tokens" card in Settings (create / copy-once / revoke).

**Out (deliberately):**

- Per-token scopes/permissions (all tokens grant the owner's full API access —
  YAGNI for single-user self-hosted; revisit if multi-tenant).
- Token expiry/rotation policy (tokens live until revoked). A nullable
  `expiresAt` column is added now but not enforced by UI; enforcement is a
  trivial follow-on if wanted.
- OAuth / device-authorization flows.

## Why a custom model (not Better Auth's apiKey plugin)

Better Auth ships an `apiKey()` plugin, but two things tilt to a small custom
model: (1) **OPDS clients (incl. Kobo) authenticate with HTTP Basic** (password
= token), so the guard must accept the token over **both** `Authorization:
Bearer` (Obsidian/API) and Basic (OPDS) — a custom resolver handles both
cleanly; (2) full control over a stable token **format** (`burk_pat_…`) and
SHA-256-at-rest, with no dependence on the plugin's `getSession` behaviour under
the better-sqlite3 driver adapter. The model is tiny and fully unit-testable.

## Data model

New Prisma model (committed migration — `prisma db push` is prohibited):

```prisma
model PersonalAccessToken {
  id         String    @id @default(cuid())
  userId     String
  name       String
  tokenHash  String    @unique // sha256(secret) — the secret is never stored
  prefix     String            // display hint, e.g. "burk_pat_ab12…"
  lastUsedAt DateTime?
  expiresAt  DateTime?         // reserved; not UI-enforced yet
  createdAt  DateTime  @default(now())
  revokedAt  DateTime?
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

Add the back-relation `personalAccessTokens PersonalAccessToken[]` to `User`.

**Token format:** `burk_pat_` + 32 bytes base64url (≈43 chars). The plaintext is
returned **once** at creation; only `sha256(secret)` is persisted. `prefix` =
the first ~12 chars for list display.

## API (spec-first → openapi.yaml → codegen)

New tag `tokens`, security `cookieAuth`/`bearerAuth` (creating a token needs an
interactive session, not another token — but accept either):

- `POST /api/v1/tokens` body `{ name }` → `201 { id, name, prefix, token, createdAt }`
  (`token` = full plaintext, the only time it is returned).
- `GET /api/v1/tokens` → `{ tokens: [{ id, name, prefix, lastUsedAt, createdAt }] }`
  (never returns the secret or hash).
- `DELETE /api/v1/tokens/{id}` → `204` (sets `revokedAt`; idempotent-ish — 404 if
  not owned).

## Guard extension

Today `SessionGuard` calls `auth.getSession(req)` → `req.userId`. Extend the
resolution so that, when no Better Auth session is found, the request is checked
for a PAT:

1. `Authorization: Bearer <t>` where `<t>` starts with `burk_pat_` → validate as PAT.
2. `Authorization: Basic <base64>` → decode; if the **password** field starts
   with `burk_pat_` → validate as PAT (this is the OPDS/Kobo path).

Validation: `sha256(secret)` → lookup by `tokenHash` → reject if missing,
revoked, or expired → set `lastUsedAt = now()` (best-effort, non-blocking) →
resolve `userId`. A Better Auth session bearer (mobile) is unaffected because it
does **not** carry the `burk_pat_` prefix — the guard tries the session first,
PAT second.

Keep this in the existing auth layer (a `PatService.resolve(req): userId | null`
the guard calls after the session check) so the two schemes stay separable and
testable.

## Testing (DoD)

- `PatService` units: create → returns plaintext once, stores only the hash;
  validate(valid) → userId + `lastUsedAt` bumped; validate(revoked/expired/unknown)
  → null; Basic-header password extraction; Bearer prefix discrimination (a
  Better-Auth session bearer is **not** mistaken for a PAT).
- Repo-layer test: tokens are user-scoped (a user can't see/revoke another's).
- Backend gates: `pnpm --filter @app/backend {lint,typecheck,test}`; committed
  migration applies cleanly.
- Web: Settings card unit-tested per the web convention (extract any pure logic —
  e.g. token-list view-model — into a util + spec); `{test,typecheck,lint}` +
  container `nuxt build`.

## Verification ceiling

Fully verifiable here (backend unit/integration + web build). No external device
needed — the consuming clients (Kobo, Obsidian) are exercised in P4/P5.

## Consumed by

- **P4 (`kobo`)** — OPDS feed + EPUB download authenticate via PAT (Basic).
- **P5 (`obsidian`)** — export API + plugin authenticate via PAT (Bearer).
