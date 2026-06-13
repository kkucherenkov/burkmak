# docker/

Local dev stack. Launch from the repo root:

```sh
docker compose -f docker/compose.yml up -d
```

## Services

burkmak runs a slim stack — SQLite (file-backed, no DB container), an in-process
job worker, and native SSE. There is no Postgres / Redis / Centrifugo / Grafana.

| Service | Image                         | Port | Notes                                                              |
| ------- | ----------------------------- | ---- | ------------------------------------------------------------------ |
| backend | `apps/backend/Dockerfile.dev` | 3000 | Mounts repo, `prisma db push` to SQLite, runs `nest start --watch` |
| web     | `apps/web/Dockerfile.dev`     | 3001 | Mounts repo, runs `nuxt dev`                                       |

The SQLite database lives at `apps/backend/burkmak.db` on the mounted repo
volume (gitignored), so it persists across container restarts.

## Customising

Change `BETTER_AUTH_SECRET` and other secrets before deploying.
