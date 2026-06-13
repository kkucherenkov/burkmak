# Local observability — grafana/otel-lgtm

The `otel-lgtm` service in `docker/compose.yml` runs the
[`grafana/otel-lgtm`](https://github.com/grafana/otel-lgtm) all-in-one image.
It bundles Prometheus, Loki, Tempo, and Grafana pre-wired to an OTLP collector,
so a single container is enough for local development.

## Access

| URL                   | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| http://localhost:3200 | Grafana UI (anonymous admin, no login required) |
| `localhost:4317`      | OTLP gRPC ingest                                |
| `localhost:4318`      | OTLP HTTP ingest                                |

## Wiring the backend

The backend reads `OTEL_EXPORTER_OTLP_ENDPOINT` from the environment
(see `apps/backend/src/telemetry.ts`).

- **Inside Docker Compose** — the variable is set automatically in
  `docker/compose.yml`:
  ```
  OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-lgtm:4318
  ```
- **Outside Docker** (running `pnpm --filter @app/backend dev` directly) — set
  it in `apps/backend/.env`:
  ```
  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
  ```
  Leave the variable blank (or remove it) to disable OTel in unit-test runs.
