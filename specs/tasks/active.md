# Active tasks

## T-2026-06-14-001 — migrate web i18n to global .ts langDir locale files

- Created: 2026-06-14
- Owner: claude
- Spec: —
- Goal: Fix `nuxt build` failure caused by Vite 8 + @nuxtjs/i18n incompatibility with `<i18n lang="json">` SFC blocks (`?vue&type=i18n&lang.json` virtual module parse error). Move all translations to `apps/web/i18n/locales/{en,ru}.ts` global files.
- Spec diff: none (no API changes)
- Codegen impact: no
- Sub-steps:
  - [x] Create `apps/web/i18n/i18n.config.ts`
  - [x] Create `apps/web/i18n/locales/en.ts` and `ru.ts`
  - [x] Update `apps/web/nuxt.config.ts` (add `file:` to each locale)
  - [x] Migrate 9 SFC files (remove `<i18n>` blocks, namespace `t()` calls)
  - [x] Verify `pnpm --filter @app/web build` succeeds (Σ Total size: 2.64 MB)
  - [x] lint + typecheck + test green (17/17)
  - [x] Update docs (i18n.md, agents/frontend-engineer.md)
- Status: in-progress
- Blockers: —
