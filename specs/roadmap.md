# burkmak — Roadmap

Phase order and subsystem-to-phase mapping. The full requirements live in
[PRD.md](./PRD.md §6–§7); this file is the authority for **what ships in which
phase**. Each phase is one spec → plan → build cycle.

Dependency shape: **S0 → S1 → S2**, then **S3 / S4 / S5** in parallel.

| Phase | Subsystem | Ships                                                                                    | Spec                                                                                       |
| ----- | --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P1    | S0 + S1   | Foundation (SQLite, stripped stack, jobs+SSE spine) **and** core library (save/organise) | [features/2026-06-13-foundation-and-core.md](./features/2026-06-13-foundation-and-core.md) |
| P2    | S2        | On-demand article extraction, reader view, FTS5 body search, highlights & notes          | _tbd_                                                                                      |
| P3    | S3        | Mobile share-sheet capture, browser bookmarklet                                          | _tbd_                                                                                      |
| P4    | S4        | EPUB/KEPUB generation, native Kobo sync emulation, device pairing, read-state sync-back  | _tbd_                                                                                      |
| P5    | S5        | Obsidian export API + Obsidian plugin                                                    | _tbd_                                                                                      |

Notes:

- **P1 bundles S0 + S1** so the first build produces a usable app, not just
  infrastructure.
- **P4 (Kobo) and P5 (Obsidian) both depend on P2** — they export the article
  body / highlights that P2 creates.
- **Import** (Pocket/Instapaper/Wallabag) and a **packaged browser extension**
  are deferred beyond P5; tracked as future work, not in this roadmap yet.
- Design (tokens + mockups) is produced once up-front from the PRD design brief
  (PRD §11) so the system is coherent across all phases.
