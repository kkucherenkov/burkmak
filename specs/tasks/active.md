# Active tasks

## T-2026-06-15-001 — packages/obsidian-plugin scaffold + implementation

- Created: 2026-06-15
- Owner: claude
- Spec: [specs/features/2026-06-15-obsidian-plugin.plan.md](../features/2026-06-15-obsidian-plugin.plan.md)
- Goal: New `packages/obsidian-plugin` workspace package — settings, "Sync from burkmak" command, pure lib unit tests, esbuild to main.js.
- Spec diff: none (plugin only, plain HTTP via requestUrl)
- Codegen impact: no
- Sub-steps:
  - [ ] Task 1: Package scaffold (package.json, manifest.json, tsconfig.json, esbuild.config.mjs, vitest.config.ts, stub main.ts)
  - [ ] Task 2: Pure lib — export-url (TDD)
  - [ ] Task 3: Pure lib — frontmatter parser (TDD)
  - [ ] Task 4: Settings tab (src/settings.ts)
  - [ ] Task 5: Plugin entry + sync command (src/main.ts)
  - [ ] Task 6: README + gates + gitignore
- Status: in-progress
- Blockers: —
