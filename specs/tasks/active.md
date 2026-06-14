# Active tasks

## T-2026-06-14-005 — S1-mobile (library / item_detail / add_link + live SSE)

- Created: 2026-06-14
- Owner: claude
- Branch: `feat/s1-mobile`
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B5
- Plan: [specs/features/2026-06-13-s1-mobile.plan.md](../features/2026-06-13-s1-mobile.plan.md)
- Goal: Flutter library experience — list (filters + `q`), add-link, item metadata detail; flutter_bloc cubits, Dio SSE (pending→ready live), generated `app_api_client`, slang i18n (en/ru/uk/el).
- Depends on: S1-auth (merged) + generated Dart client. Codegen impact: re-run spec:codegen.
- Sub-steps:
  - [x] 1: codegen + fix app_api_client path + pub get
  - [x] 2: ItemsApi/TagsApi factories + DI
  - [x] 3: EventsClient (SSE byte-stream → AppEvent)
  - [x] 4: ItemsRepository
  - [x] 5: LibraryState + LibraryCubit (TDD)
  - [x] 6: LibraryScreen + item card + filter bar
  - [x] 7: DetailCubit + state (TDD)
  - [x] 8: ItemDetailScreen
  - [x] 9a: AddLinkCubit + state (TDD) — cubit done; screen pending (after step 10 i18n)
  - [ ] 9b: AddLinkScreen (after i18n step 10)
  - [x] 10: slang namespaces (library/item_detail/add_link × en/ru/uk/el)
  - [ ] 11: routes + cubit DI + app wiring
  - [ ] 12: verification
- Status: in-progress
- Blockers: —
