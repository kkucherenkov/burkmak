# syntax=docker/dockerfile:1

# ── build ────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS build

RUN apk add --no-cache libc6-compat && corepack enable

WORKDIR /repo
ENV CI=1 \
    NUXT_TELEMETRY_DISABLED=1

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @app/specs bundle
RUN pnpm --filter @app/design-tokens build
RUN pnpm --filter @app/ui build
RUN pnpm --filter @app/web build

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime

ENV NODE_ENV=production \
    PORT=3001 \
    NUXT_TELEMETRY_DISABLED=1

WORKDIR /app
# Nitro bundles its own dependencies — .output is the entire app.
COPY --from=build --chown=node:node /repo/apps/web/.output ./.output

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/').then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
