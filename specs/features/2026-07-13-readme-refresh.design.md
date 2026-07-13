# Design: README refresh + GitHub publication tidy

Date: 2026-07-13
Status: approved (chat) — pending file review
Branch: `docs/readme-refresh`

## Goal

The root README is a month stale (last touched 2026-06-15): it predates native
Kobo sync, OPDS covers/pagination/search, the theme switcher, and auto-extract
on save, and its screenshots are design-mockup renders. Refresh it so the
published GitHub repo is accurate and current; do the small remaining tidy.

## Changes

### README.md (edit in place — keep existing voice, structure, section order)

1. **Status blockquote**: P1–P6 shipped; native Kobo store-protocol sync is
   shipped (auto-sync + reading-state write-back), not a fast-follow. Keep the
   honest ceiling: end-to-end verification on a physical Kobo is still pending
   (needs HTTPS in front).
2. **Features → Save & organise**: add auto-extraction on save — every saved
   article is extracted in the background automatically (reader/OPDS/Kobo
   ready without a tap); existing libraries were backfilled once at boot.
3. **Features → Read & highlight**: extraction wording changes from
   "on-demand" to automatic-with-manual-retry.
4. **Features → new bullet under Save & organise or UI-adjacent**: theme
   switcher — system/light/dark from the header and Settings, full dark theme.
5. **Features → Sync & export**: rewrite Kobo paragraph — two tiers:
   - OPDS catalog (stock Kobo, Settings → "Add an OPDS catalog"): now with
     covers, cursor pagination, OpenSearch.
   - **Native store-protocol sync** (`/api/v1/kobo/{token}/*`, PAT in URL path
     because Nickel can't send auth headers): device auto-sync on connect,
     reading-state write-back (Finished → read, ReadyToRead → unread),
     archive/delete tombstones. Setup: point `api_endpoint` in
     `Kobo eReader.conf` at `https://<host>/api/v1/kobo/<PAT>` (HTTPS needed).
6. **Roadmap table**: add row `P6 | polish | native Kobo store sync ·
OPDS covers/pagination/search · theme switcher · auto-extract on save |
✅ shipped`.
7. **Architecture mermaid**: add Kobo e-reader client node →
   `OPDS + Kobo store API` edge into the backend.
8. **Screenshots section**: swap to real app captures (see below); caption no
   longer claims mockup renders. Grid: Library (light) · Reader with highlight
   · Save flow · Library (dark).
9. Everything else (quick start, stack table, "How this project is built",
   docs table, license, acknowledgements) verified and kept; only stale
   details corrected. Clone URL stays `<this-repo>` generic.

### Screenshots (assets/screenshots/)

Chromium recipe (playwright-core + `/usr/bin/chromium`, 1280×800) against the
running dev stack: fresh throwaway user; save 3 real articles (auto-extract
prepares them); tag one; highlight a passage in the reader. Capture and
overwrite: `library.png`, `reader.png`, `save.png`; add `library-dark.png`
(colorScheme dark + toggled theme showing the header toggle). `welcome.png`
kept only if still referenced, else removed with its README cell replaced by
the dark shot.

### Tidy

- Delete merged stale branches: `feat/s2-backend`, `feat/s2-design`,
  `chore/prettier-ignore-generated` (all ancestors of main — verified).
- README relative-link check: every referenced path must exist in the repo.
- No new badges (repo slug unknown until first push); no LICENSE /
  CONTRIBUTING / SECURITY changes (present and adequate); `.mcp.json` stays
  untracked (placeholders only). Secrets sweep already done: only
  `.env.example` files tracked, no real PATs anywhere.

## Out of scope

- specs/HANDOFF.md deep refresh (cold-start doc for agents, not the GitHub
  audience).
- CI badge, repo description/topics — delivered as suggestions in the final
  report for the user to apply on GitHub after the first push.
- Any code change.

## Verification

- `pnpm format` clean; README renders (mermaid syntax GitHub-compatible).
- Link check script over README relative links → all exist.
- Screenshots: 4 files present, each < 300 KB, visually spot-checked (Read
  tool renders images) before commit.
