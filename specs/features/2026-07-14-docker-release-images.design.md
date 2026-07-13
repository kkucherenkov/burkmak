# Docker release images + homelab deploy — design

**Date:** 2026-07-14
**Status:** approved for planning
**Related:** `docker/compose.yml` (dev stack, unchanged), `.github/workflows/ci.yml`

## Goal

A release-only GitHub workflow that publishes production Docker images for the
backend and web apps to GitHub Packages (GHCR), plus a `deploy/` directory so a
homelab installs the whole app with `docker compose up -d`.

## Decisions (agreed in brainstorming)

| Decision           | Choice                                                                            | Why                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trigger            | Git tag `v*` (approach A)                                                         | One-command release: `git tag v0.1.0 && git push origin v0.1.0`. Workflow also auto-creates the GitHub Release.                                              |
| Registry           | GHCR — `ghcr.io/kkucherenkov/burkmak-backend`, `ghcr.io/kkucherenkov/burkmak-web` | GitHub Packages, free for public repos, auth via built-in `GITHUB_TOKEN` (`packages: write`) — zero new secrets.                                             |
| Architectures      | `linux/amd64` + `linux/arm64`                                                     | Covers x86 homelab now and ARM hardware later. Release-only, so the slower QEMU build is acceptable.                                                         |
| Image tags         | `X.Y.Z` (from the git tag) + `latest`                                             | Homelab pins `latest` or a version; no `X.Y` floating tags — YAGNI.                                                                                          |
| Homelab TLS        | None — plain HTTP on the LAN                                                      | User choice. `deploy/README.md` documents the caveat: real Kobo device sync requires HTTPS; web + OPDS work over HTTP.                                       |
| Web serving        | Nitro node server (`node .output/server/index.mjs`)                               | With `ssr: false`, Nitro injects `NUXT_PUBLIC_*` at request time — API URLs stay configurable per install. A static export would bake them in at build time. |
| Backend base image | `node:24-slim` (Debian)                                                           | `better-sqlite3` is a native addon; glibc prebuilds exist for both arches, avoiding slow QEMU node-gyp compiles that musl/alpine risks on arm64.             |
| Web base image     | `node:24-alpine`                                                                  | No native deps; smallest footprint.                                                                                                                          |
| Migrations         | `prisma migrate deploy` runs in the backend entrypoint before `node dist/main.js` | Upgrade = `docker compose pull && docker compose up -d`. `prisma db push` stays prohibited.                                                                  |
| Versioning source  | Git tag only                                                                      | `package.json` versions are not bumped by the workflow — no version automation yet (YAGNI).                                                                  |

## Components

### 1. `apps/backend/Dockerfile` (new, multi-stage)

- **Build stage** (`node:24-slim` + pnpm via corepack, pinned `pnpm@10.33.0`):
  `pnpm install --frozen-lockfile` for the workspace → `pnpm --filter @app/specs
bundle` → `prisma generate` → `nest build` → `pnpm --filter @app/backend
deploy --prod /out` to prune to production deps.
- **Runtime stage** (`node:24-slim`, non-root user): copies the pruned app,
  `dist/`, `prisma/` (schema + migrations), and the bundled spec to
  `dist/specs/openapi.json` — the first path
  `openapi-validator.middleware.ts` probes from `process.cwd()`.
- `prisma` moves from `devDependencies` to `dependencies` in
  `apps/backend/package.json` so `pnpm deploy --prod` carries the CLI into
  the runtime image — `migrate deploy` runs offline at boot, no `npx`
  network fetch. (~30 MB image cost, accepted in Risks.)
- **Entrypoint:** `prisma migrate deploy && node dist/main.js`. A migration
  failure exits non-zero so compose `restart: unless-stopped` + healthcheck
  surface it.
- Env contract (all existing `AppConfig` keys, no code changes):
  `DATABASE_URL=file:/data/burkmak.db`, `DATA_DIR=/data`,
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_BASE_PATH`,
  `CORS_ORIGINS`, `PORT`.

### 2. `apps/web/Dockerfile` (new, multi-stage)

- **Build stage:** workspace install → spec bundle → `nuxt build`.
- **Runtime stage:** copies only `.output/`; `CMD ["node",
".output/server/index.mjs"]`; `PORT=3001`. No node_modules at runtime —
  Nitro bundles its deps.

### 3. `.github/workflows/release.yml` (new)

- `on: push: tags: ['v*.*.*']`. Permissions: `contents: write` (release),
  `packages: write` (GHCR).
- Jobs: QEMU + buildx setup → `docker/login-action` to ghcr.io →
  `docker/metadata-action` (semver tag + `latest`) → two
  `docker/build-push-action` builds (backend, web) with GitHub Actions layer
  cache (`cache-from/to: gha`) → `gh release create` with auto-generated
  notes and a pointer to `deploy/README.md`.
- Images carry `org.opencontainers.image.source` pointing at the repo so the
  packages link to it and inherit public visibility.

### 4. CI smoke-build guard (new `.github/workflows/docker-build.yml`)

- Standalone workflow (native `on.pull_request.paths` filtering — no
  path-filter action needed), amd64 only, `push: false`, triggered by
  `apps/*/Dockerfile`, `deploy/**`, `.github/workflows/release.yml`, the
  workflow itself, plus lockfile/prisma changes. Shares the buildx `gha`
  cache scope with `release.yml`. Guarantees a release tag is never the
  first time a production Dockerfile builds.

### 5. `deploy/` (new)

- `compose.yml`: two services pulling the GHCR images; named volume
  `burkmak-data:/data`; backend healthcheck via `node -e "fetch(...)"`
  (slim image has no wget/curl); web `depends_on` backend healthy; ports
  3000/3001 published.
- `.env.example`: `BURKMAK_HOST` (LAN IP/hostname), `BETTER_AUTH_SECRET`,
  `IMAGE_TAG` (default `latest`), port overrides. Compose derives
  `BETTER_AUTH_URL`, `CORS_ORIGINS`, `NUXT_PUBLIC_*` from `BURKMAK_HOST`.
- `README.md`: install (copy `compose.yml` + `.env`, edit, `up -d`), upgrade
  (`pull` + `up -d`), backup (the `/data` volume is everything), Kobo HTTPS
  caveat, bookmarklet/save URL note.

## Not in scope

- HTTPS / reverse proxy in the deploy stack (user runs LAN HTTP).
- Version automation (release-please, changesets, package.json bumps).
- Mobile app distribution.
- Postgres/Redis/Centrifugo services — the app runs on SQLite; the deploy
  stack is exactly two containers + one volume.

## Testing

1. Local: `docker build` both Dockerfiles; run `deploy/compose.yml` against
   the locally built tags (image override), then verify
   `GET /api/v1/health` = 200, web login page renders, and a saved article's
   cached image streams (exercises `DATA_DIR=/data`).
2. CI: the smoke-build job builds both images on any PR touching them.
3. Release rehearsal: push `v0.1.0` after merge; verify both packages appear
   under GitHub Packages with `0.1.0` + `latest` for both arches
   (`docker manifest inspect`), and the GitHub Release exists.

## Risks

- **better-sqlite3 under QEMU:** mitigated by Debian slim (prebuilds); if a
  compile is still triggered, add build tools to the build stage only —
  runtime stage stays slim.
- **Prisma CLI in runtime image:** adds ~30 MB; accepted for offline,
  deterministic boot migrations.
- **First multi-arch release is slow (~15 min):** accepted; releases are rare
  and layer-cached afterwards.
