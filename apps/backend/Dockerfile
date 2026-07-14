# syntax=docker/dockerfile:1

# ── build ────────────────────────────────────────────────────────────────────
FROM node:24-slim AS build

# Toolchain is a fallback: better-sqlite3 normally downloads a glibc prebuild,
# but if one is missing for a platform, node-gyp compiles from source.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable

WORKDIR /repo
ENV CI=1

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @app/specs bundle
RUN pnpm --filter @app/backend prisma:generate
RUN pnpm --filter @app/backend build

# Self-contained production dir: backend files + pruned prod node_modules.
# --legacy is required on pnpm 10 (new deploy mode needs injected workspaces).
RUN pnpm --filter @app/backend deploy --prod --legacy /prod
# deploy selects files npm-pack-style, which respects .gitignore — the
# gitignored build artifact dist/ must be copied in explicitly.
RUN cp -a apps/backend/dist /prod/dist && test -f /prod/dist/main.js
# The deploy re-installs node_modules, so the Prisma client must be
# regenerated against them (CLI is a prod dependency).
RUN cd /prod && node_modules/.bin/prisma generate
# Source and tests are not needed at runtime — dist/ carries the app.
RUN rm -rf /prod/src /prod/test /prod/Dockerfile.dev

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:24-slim AS runtime

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app
COPY --from=build --chown=node:node /prod /app
# COPY --chown only chowns the files/dirs it copies in, not the /app
# directory entry itself (WORKDIR already created it as root:root). Without
# this, the non-root user below can write into existing subpaths but not
# create new top-level ones (e.g. the mock storage service's ./.storage).
RUN chown node:node /app

# SQLite + extracted-article caches live here; pre-owning the mount point
# makes the named volume writable for the non-root user on first use.
RUN mkdir /data && chown node:node /data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/v1/health').then(r=>process.exit([200,503].includes(r.status)?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]
