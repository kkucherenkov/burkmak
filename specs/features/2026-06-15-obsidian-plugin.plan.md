# Obsidian Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A new `packages/obsidian-plugin` Obsidian plugin: settings (base URL, PAT, folder, read-state); a "Sync from burkmak" command that fetches the export bundle and writes one note per article into the vault, **idempotent by `burkmakId`** frontmatter.

**Architecture:** A standard Obsidian plugin built with esbuild → single `main.js` + `manifest.json`. HTTP via Obsidian's `requestUrl` (bypasses CORS). Pure logic (URL build, frontmatter `burkmakId` parsing, count summary) lives in `src/lib/*` and is unit-tested with vitest; the plugin shell (`main.ts`, settings tab, vault writes) is thin and verified at runtime inside Obsidian (out of sandbox).

**Tech Stack:** TypeScript, esbuild, `obsidian` types, vitest. Consumes the `export/markdown` API (plain HTTP — no `@app/api-client-ts` coupling).

**Spec:** [2026-06-15-obsidian-export.md](./2026-06-15-obsidian-export.md) (plugin section). **Depends on** `obsidian-backend` (the export API contract must exist).

**Branch:** `feat/obsidian-plugin` off `main` (after `obsidian-backend` merges). Commit per task; `--no-ff` when gates pass.

---

## File structure

| File                                              | Responsibility                                  | New |
| ------------------------------------------------- | ----------------------------------------------- | --- |
| `packages/obsidian-plugin/package.json`           | `@app/obsidian-plugin` private pkg + scripts    | ✓   |
| `packages/obsidian-plugin/manifest.json`          | Obsidian plugin manifest                        | ✓   |
| `packages/obsidian-plugin/tsconfig.json`          | extends `@app/tsconfig`                         | ✓   |
| `packages/obsidian-plugin/esbuild.config.mjs`     | bundle `src/main.ts` → `main.js`                | ✓   |
| `packages/obsidian-plugin/vitest.config.ts`       | unit tests for `src/lib`                        | ✓   |
| `packages/obsidian-plugin/src/main.ts`            | plugin entry: command + settings registration   | ✓   |
| `packages/obsidian-plugin/src/settings.ts`        | settings type + settings tab                    | ✓   |
| `packages/obsidian-plugin/src/lib/export-url.ts`  | pure: build `export/markdown` URL from settings | ✓   |
| `packages/obsidian-plugin/src/lib/frontmatter.ts` | pure: `parseBurkmakId(content)`                 | ✓   |
| `packages/obsidian-plugin/src/lib/*.spec.ts`      | unit tests                                      | ✓   |
| `packages/obsidian-plugin/README.md`              | install (manual / BRAT) + usage                 | ✓   |

`pnpm-workspace.yaml` already globs `packages/*` — no workspace edit needed. Read first: a sibling package's `package.json`/`tsconfig.json` (e.g. `packages/ui`) for the shared-config wiring + `@app/tsconfig` usage.

---

## Task 1: Package scaffold

**Files:** `package.json`, `manifest.json`, `tsconfig.json`, `esbuild.config.mjs`, `vitest.config.ts`.

- [ ] **package.json** — `name: "@app/obsidian-plugin"`, `private: true`, `type: "module"`, scripts: `build` (`node esbuild.config.mjs`), `dev` (`node esbuild.config.mjs --watch`), `typecheck` (`tsc --noEmit`), `lint` (`eslint "src/**/*.ts"`), `test` (`vitest run --passWithNoTests`). devDeps: `obsidian` (latest), `esbuild`, `typescript`, `vitest`, `@app/eslint-config` (workspace), `@app/tsconfig` (workspace), `builtin-modules`.
- [ ] **manifest.json** — `{ "id": "burkmak", "name": "burkmak", "version": "0.1.0", "minAppVersion": "1.5.0", "description": "Export your burkmak highlights and notes into your vault.", "author": "burkmak", "isDesktopOnly": false }`.
- [ ] **tsconfig.json** — extends `@app/tsconfig/base.json` (check the actual path siblings use), `compilerOptions`: `module: ESNext`, `target: ES2020`, `lib: [DOM, ES2020]`, `moduleResolution: Bundler`, `noEmit: true`, `strict: true`, `skipLibCheck: true`; `include: ["src"]`.
- [ ] **esbuild.config.mjs** — bundle `src/main.ts` → `main.js`, `format: 'cjs'` (Obsidian requires CJS), `platform: 'node'`, `target: 'es2020'`, `external: ['obsidian', 'electron', ...builtinModules]`, `bundle: true`, `sourcemap` in dev, `--watch` support. Obsidian loads `main.js` + `manifest.json` from the plugin folder.
- [ ] **vitest.config.ts** — minimal (`test: { include: ['src/**/*.spec.ts'] }`).
- [ ] Run `pnpm install` (root) so the workspace picks up the package. Verify `pnpm --filter @app/obsidian-plugin typecheck` runs (will pass once src exists; for now create a stub `src/main.ts` exporting a class extending `Plugin` with empty `onload`).
- [ ] Commit — `git add packages/obsidian-plugin && git commit -m "chore(obsidian-plugin): scaffold package (obsidian-plugin)"`

---

## Task 2: Pure lib — export URL (TDD)

**Files:** `src/lib/export-url.ts`, `src/lib/export-url.spec.ts`.

- [ ] **Step 1: Failing test**

```ts
import { describe, expect, it } from 'vitest';
import { buildExportUrl } from './export-url';

describe('buildExportUrl', () => {
  it('joins base + path + filters, trimming trailing slash', () => {
    expect(buildExportUrl('http://h/api/v1/', { readState: 'unread', includeEmpty: false })).toBe(
      'http://h/api/v1/export/markdown?readState=unread',
    );
  });
  it('omits empty filters; adds includeEmpty only when true', () => {
    expect(buildExportUrl('http://h/api/v1', {})).toBe('http://h/api/v1/export/markdown');
    expect(buildExportUrl('http://h/api/v1', { includeEmpty: true })).toBe(
      'http://h/api/v1/export/markdown?includeEmpty=true',
    );
  });
});
```

- [ ] **Step 2–4:** FAIL → implement (`base.replace(/\/$/,'')+'/export/markdown'` + `URLSearchParams` for set filters; only append `?` when params exist) → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat(obsidian-plugin): export-url builder (obsidian-plugin)"`

---

## Task 3: Pure lib — frontmatter burkmakId (TDD)

**Files:** `src/lib/frontmatter.ts`, `src/lib/frontmatter.spec.ts`.

- [ ] **Step 1: Failing test**

```ts
import { describe, expect, it } from 'vitest';
import { parseBurkmakId } from './frontmatter';

describe('parseBurkmakId', () => {
  it('reads burkmakId from a YAML frontmatter block', () => {
    expect(parseBurkmakId('---\nburkmakId: it1\ntitle: X\n---\nbody')).toBe('it1');
  });
  it('returns null without frontmatter or key', () => {
    expect(parseBurkmakId('no frontmatter')).toBeNull();
    expect(parseBurkmakId('---\ntitle: X\n---')).toBeNull();
  });
});
```

- [ ] **Step 2–4:** FAIL → implement (match a leading `---\n…\n---` block, scan for `burkmakId:` line, return trimmed value or null) → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat(obsidian-plugin): frontmatter parser (obsidian-plugin)"`

---

## Task 4: Settings tab

**Files:** `src/settings.ts`.

- [ ] Define `BurkmakSettings { baseUrl: string; token: string; folder: string; readState: '' | 'unread' | 'read' | 'archived'; includeEmpty: boolean }` + `DEFAULT_SETTINGS` (`baseUrl: 'http://localhost:3000/api/v1'`, `folder: 'burkmak'`, others empty/false).
- [ ] A `BurkmakSettingTab extends PluginSettingTab` with `Setting` rows for base URL, token (password-style), folder, read-state (dropdown incl. "all"), includeEmpty (toggle); each persists via `this.plugin.saveSettings()`.
- [ ] typecheck PASS. Commit — `git commit -m "feat(obsidian-plugin): settings tab (obsidian-plugin)"`

---

## Task 5: Plugin entry + sync command

**Files:** `src/main.ts`.

- [ ] `export default class BurkmakPlugin extends Plugin` — `onload`: `await this.loadSettings()`; `addSettingTab(new BurkmakSettingTab(this.app, this))`; `addCommand({ id: 'sync', name: 'Sync from burkmak', callback: () => this.sync() })`. `loadSettings`/`saveSettings` via `loadData`/`saveData` merged with `DEFAULT_SETTINGS`.
- [ ] `sync()`:
  1. Validate `baseUrl` + `token` set (else `new Notice('Set base URL and token in settings')`).
  2. `const url = buildExportUrl(settings.baseUrl, { readState: settings.readState || undefined, includeEmpty: settings.includeEmpty })`.
  3. `const res = await requestUrl({ url, headers: { Authorization: 'Bearer ' + settings.token } })` (Obsidian's `requestUrl` — bypasses CORS). On non-200 → `new Notice('burkmak: ' + res.status)` and return.
  4. `const { notes } = res.json` (each `{ itemId, title, filename, markdown }`). Ensure the folder exists (`this.app.vault.adapter.exists` / `createFolder`).
  5. For each note: find an existing file in `folder` whose content `parseBurkmakId` === `note.itemId` (read each `.md` via the vault); if found → `vault.modify(existing, note.markdown)` (idempotent, rename-safe); else → `vault.create(folder + '/' + note.filename, note.markdown)`. Count created/updated; continue on per-note errors.
  6. `new Notice('burkmak: ' + created + ' created, ' + updated + ' updated')`.
- [ ] typecheck + lint PASS. Commit — `git commit -m "feat(obsidian-plugin): sync command (obsidian-plugin)"`

---

## Task 6: README + slice gates

- [ ] **README.md** — manual install (copy `main.js` + `manifest.json` into `<vault>/.obsidian/plugins/burkmak/`) / BRAT; create a PAT in burkmak Settings; set base URL + token; run the "Sync from burkmak" command. Note it's not in the community store.
- [ ] **Gates:** `pnpm --filter @app/obsidian-plugin test` (lib specs pass); `pnpm --filter @app/obsidian-plugin typecheck`; `pnpm --filter @app/obsidian-plugin lint`; `pnpm --filter @app/obsidian-plugin build` → emits `main.js`. `pnpm format`.
- [ ] Confirm `main.js` is gitignored (build artifact) — add a `packages/obsidian-plugin/.gitignore` for `main.js`/`*.map` if the root ignore doesn't cover it; commit `manifest.json` + source, NOT `main.js`.
- [ ] Commit — `git commit -m "docs(obsidian-plugin): README + gitignore build output (obsidian-plugin)"`

## Verification ceiling

`src/lib` is unit-tested; the package **builds + typechecks here**. The in-Obsidian runtime (settings tab, the Sync command, vault writes, idempotent overwrite) is verifiable only inside Obsidian — out of sandbox; documented.

## Self-review checklist

- HTTP via `requestUrl` (CORS-safe); pure logic isolated in `src/lib` + tested.
- Idempotent by `burkmakId` (overwrites the matching file even if the user renamed it).
- `main.js` not committed; `manifest.json` + source committed. esbuild outputs CJS, `obsidian` external.
