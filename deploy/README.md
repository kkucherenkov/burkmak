# Deploy burkmak on your homelab

Two containers (API + web app) and one data volume. Images are published to
GitHub Packages on every release:
[`burkmak-backend`](https://github.com/kkucherenkov/burkmak/pkgs/container/burkmak-backend) ·
[`burkmak-web`](https://github.com/kkucherenkov/burkmak/pkgs/container/burkmak-web)
(`linux/amd64` + `linux/arm64`).

## Install

```sh
mkdir burkmak && cd burkmak
curl -fsSLO https://raw.githubusercontent.com/kkucherenkov/burkmak/main/deploy/compose.yml
curl -fsSL https://raw.githubusercontent.com/kkucherenkov/burkmak/main/deploy/.env.example -o .env
$EDITOR .env        # set BURKMAK_HOST and BETTER_AUTH_SECRET
docker compose up -d
```

Open `http://<BURKMAK_HOST>:3001`, create your account, start saving articles.
Database migrations run automatically every time the backend starts.

## Upgrade

```sh
docker compose pull && docker compose up -d
```

Pin a specific version instead of `latest` by setting `IMAGE_TAG=0.1.0` in
`.env`.

## Backup

Everything lives in the `burkmak-data` volume (SQLite database + cached
articles, images, and EPUBs). Stop the backend first so the SQLite database
isn't mid-write (WAL) during the tar — a live tar can produce a silently
torn backup:

```sh
docker compose stop backend
```

```sh
docker run --rm -v burkmak_burkmak-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/burkmak-backup.tar.gz -C /data .
```

```sh
docker compose start backend
```

## Limitations over plain HTTP

This stack serves plain HTTP on your LAN. The web app and OPDS downloads
work fine, but **native Kobo store sync requires HTTPS** — Kobo firmware
refuses http:// endpoints. Put the backend behind your own TLS reverse
proxy (and set `BETTER_AUTH_URL`/`CORS_ORIGINS` accordingly) if you want
device sync.
