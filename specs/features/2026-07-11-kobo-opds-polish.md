# Feature spec — Kobo OPDS polish (P4 fast-follow) — covers, pagination, search

- Status: draft
- Created: 2026-07-11
- Owner: claude
- Parent: [2026-06-15-kobo-sync.md](./2026-06-15-kobo-sync.md) (P4 first slice, shipped)
- Roadmap: [../roadmap.md](../roadmap.md) (Phase P4 fast-follow, pre-native-sync)

## Goal

Make the shipped OPDS catalog pleasant on a real device: entries show **covers**
instead of blank tiles, the feed **paginates** instead of hard-capping at 100,
and the catalog is **searchable** from the Kobo's built-in OPDS search box.

Deliberately still out: native store-API sync emulation (`kobo-native-sync`,
needs a physical device — see parent spec).

## In

1. **Covers.** New nullable `Article.coverImageKey` column (Prisma migration):
   the filename (`<sha1>.<ext>`) of the **first successfully cached content
   image**, captured in `ExtractArticleHandler` right after image caching by
   scanning the rewritten HTML for the first
   `/api/v1/items/{id}/image/<key>` src. OPDS entries emit
   `<link rel="http://opds-spec.org/image">` and `…/image/thumbnail` pointing at
   the existing authenticated image route
   (`{baseUrl}/items/{id}/image/{key}` — same PAT Basic credentials the device
   already sends for the feed). Fallback when no cached image: the item's remote
   `leadImageUrl` (og:image) if present; otherwise no image links.
   Old items get covers on re-extract; no backfill job.
2. **Pagination.** `GET /api/v1/opds?cursor=` forwards to
   `IItemRepo.findMany` (cursor support already exists). Page size 50. Feed
   emits `rel="next"` (when `nextCursor` returned) and `rel="start"` links.
   Ready/non-archived filtering stays post-query, so pages may run short —
   valid per OPDS; clients follow `next` until absent.
3. **Search.** `GET /api/v1/opds/opensearch.xml` returns an OpenSearch
   description document (`application/opensearchdescription+xml`) with template
   `{baseUrl}/opds?q={searchTerms}`. The feed root gains a `rel="search"` link.
   `q` forwards to the existing repo `q` filter. Kobo/OPDS clients discover
   search via that link.

## Out

- Native Kobo sync (parent spec fast-follow) — unchanged.
- Faceted/navigation feeds (by tag, by read-state) — future nicety.
- Backfill of covers for already-extracted articles.

## API surface (spec-first)

- `GET /api/v1/opds`: add optional `cursor` (opaque) + `q` (string) query
  params. Response unchanged (atom-xml).
- `GET /api/v1/opds/opensearch.xml`: new path, tag `kobo`,
  `application/opensearchdescription+xml`. Non-JSON; no client codegen impact.

## Data

- Migration: `article.coverImageKey TEXT NULL`. Written at extraction time;
  never trusted for path resolution (the image route re-validates the key
  against the item's image directory).
- New `IArticleRepo.findCoverKeys(itemIds: string[]): Promise<Map<string, string>>`
  — one `SELECT itemId, coverImageKey FROM article WHERE itemId IN (…)`,
  entries with null keys omitted.

## Error handling

- Bad/stale `cursor` → treat as first page (repo behavior today; don't 400 a
  device we can't debug).
- `q` with no matches → valid empty feed.
- Cover file later evicted → image route 404s; readers show placeholder — feed
  build never stats the disk.

## Testing (DoD)

- Feed builder units: cover + thumbnail links (cached key / remote fallback /
  absent), next + start links, search link, XML escaping of q in self link.
- OpenSearch doc unit: valid XML, template URL.
- Extract handler unit: coverImageKey = first cached image; null when no images
  cached.
- Controller tests: cursor + q passthrough, opensearch route content type,
  PAT Basic accepted.
- Gates: `pnpm --filter @app/backend {lint,typecheck,test}`; runtime curl
  against the docker stack with a real PAT.

## Verification ceiling

Covers/pagination/search render in any desktop OPDS client (e.g. Thorium/KOReader);
the on-device Kobo tile grid remains device-only, same ceiling as the parent slice.
