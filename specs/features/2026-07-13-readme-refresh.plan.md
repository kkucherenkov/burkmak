# README Refresh + Publication Tidy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the root README up to date with the July features (native Kobo sync, OPDS polish, theme switcher, auto-extract), replace mockup-render screenshots with real app captures, and finish the last publication tidy items.

**Architecture:** Docs + assets only — zero code changes. One seeded-data capture script (node + playwright-core against the running Docker stack) produces 4 PNGs; the README is edited in place preserving its existing voice/structure; three merged stale branches are deleted.

**Tech Stack:** node 24 (built-in fetch), playwright-core + system chromium (`/usr/bin/chromium`), Prettier.

**Spec:** `specs/features/2026-07-13-readme-refresh.design.md`. Branch: `docs/readme-refresh` (already created; design committed at `c3a9208`).

## Global Constraints

- Zero code changes — only `README.md`, `assets/screenshots/*`, `specs/tasks/active.md`, and branch deletion.
- Keep the README's existing voice, structure, and section order; edit stale content in place.
- After editing `.md`: `pnpm format` (from repo root).
- Commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Bash cwd may reset between commands — prefix with `cd /home/kkucherenkov/projects/petProjects/burkmak && `.
- The dev stack must be running (`docker ps` shows `burkmak-backend-1`, `burkmak-web-1`; web at `http://localhost:3001`, API at `http://localhost:3000/api/v1`).
- Playwright's bundled browsers are broken on this machine — ALWAYS `executablePath: '/usr/bin/chromium'` with the repo's `playwright-core`. Never `npx playwright install`.
- Screenshot gotchas (learned previously): first page hit after a web-container restart triggers Vite dep optimization → blank shots (warm up with a throwaway `goto` + delay); use `domcontentloaded` + explicit `waitForSelector`, never `networkidle`; sign-up API occasionally returns a transient error — retry up to 3×.

---

### Task 1: Task-stack entry

**Files:**

- Modify: `specs/tasks/active.md`

**Interfaces:**

- Consumes: template convention from `specs/tasks/README.md`.
- Produces: `T-2026-07-13-002` entry whose sub-steps later tasks check off.

- [ ] **Step 1: Replace the body of `specs/tasks/active.md`**

The file currently holds only the header + `_No tasks in progress…_` line. New content:

```md
# Active tasks

## T-2026-07-13-002 — README refresh + GitHub publication tidy

- Created: 2026-07-13
- Owner: claude
- Spec: [specs/features/2026-07-13-readme-refresh.design.md](../features/2026-07-13-readme-refresh.design.md)
- Goal: README reflects P6 (native Kobo sync, OPDS polish, theme switcher, auto-extract); real app screenshots; stale branches deleted.
- Spec diff: none (docs + assets only)
- Codegen impact: no
- Sub-steps:
  - [ ] capture 4 real app screenshots (library, reader+highlight, save, library-dark)
  - [ ] README content refresh (status, features, roadmap P6, mermaid, screenshots grid)
  - [ ] relative-link check + format
  - [ ] delete merged stale branches
- Status: in-progress
- Blockers: —
```

- [ ] **Step 2: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add specs/tasks/active.md && git commit -m "chore(tasks): open T-2026-07-13-002 README refresh + publication tidy

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Capture real app screenshots

**Files:**

- Create: `/tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/cbb5d84e-aad7-4c2d-a5bc-338d49fccac7/scratchpad/capture-shots.mjs` (scratchpad — NOT committed)
- Overwrite: `assets/screenshots/library.png`, `assets/screenshots/reader.png`, `assets/screenshots/save.png`
- Create: `assets/screenshots/library-dark.png`
- Delete: `assets/screenshots/welcome.png`

**Interfaces:**

- Consumes: running stack; API routes `POST /auth/sign-up/email`, `POST /items`, `GET /items/{id}`, `POST /items/{id}/tags` (`{"tag": "..."}`), `GET /items/{id}/article` (`{contentText, ...}`), `POST /items/{id}/highlights` (`{quote, prefix?, suffix?, color?}`); web routes `/library`, `/items/{id}`, `/save?url=...`.
- Produces: the 4 PNG files Task 3's README grid references (exact filenames above).

- [ ] **Step 1: Write the capture script**

Create `capture-shots.mjs` in the scratchpad directory with exactly this content:

```js
// Seeds a demo user + 3 articles, then captures 4 README screenshots.
// Run from repo root: node <scratchpad>/capture-shots.mjs
import { mkdirSync } from 'node:fs';
import { chromium } from '/home/kkucherenkov/projects/petProjects/burkmak/node_modules/.pnpm/node_modules/playwright-core/index.mjs';

const API = 'http://localhost:3000/api/v1';
const WEB = 'http://localhost:3001';
const OUT = '/home/kkucherenkov/projects/petProjects/burkmak/assets/screenshots';
const EMAIL = `readme-shots-${Math.floor(Date.now() / 1000)}@example.com`;
const PASS = 'Passw0rd!Passw0rd!';
const ARTICLES = [
  'https://en.wikipedia.org/wiki/E-book',
  'https://en.wikipedia.org/wiki/Kobo_eReader',
  'http://paulgraham.com/greatwork.html',
];

let cookie = '';
async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// 1. Sign up (retry transient failures 3x)
for (let i = 0; ; i++) {
  try {
    await api('POST', '/auth/sign-up/email', { email: EMAIL, password: PASS, name: 'Kirill' });
    break;
  } catch (e) {
    if (i >= 2) throw e;
    await new Promise((r) => setTimeout(r, 2000));
  }
}
console.log('signed up', EMAIL);

// 2. Save articles; auto-extract (P6) prepares them — poll until ready
const ids = [];
for (const url of ARTICLES) {
  const item = await api('POST', '/items', { url });
  ids.push(item.id);
}
for (const id of ids) {
  for (let i = 0; i < 30; i++) {
    const it = await api('GET', `/items/${id}`);
    if (it.extractStatus === 'ready') break;
    if (it.extractStatus === 'failed') throw new Error(`extraction failed for ${it.url}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}
console.log('3 articles saved + auto-extracted');

// 3. Tags on the first two, highlight on the Paul Graham essay
await api('POST', `/items/${ids[0]}/tags`, { tag: 'reading' });
await api('POST', `/items/${ids[1]}/tags`, { tag: 'e-ink' });
await api('POST', `/items/${ids[2]}/tags`, { tag: 'essays' });
const art = await api('GET', `/items/${ids[2]}/article`);
const text = art.contentText.replace(/\s+/g, ' ');
// pick a clean sentence fragment on word boundaries for reliable anchoring
const start = text.indexOf('. ', 200) + 2;
let end = text.indexOf('. ', start + 60);
if (end === -1 || end - start > 160) end = start + text.slice(start, start + 160).lastIndexOf(' ');
const quote = text.slice(start, end + 1).trim();
await api('POST', `/items/${ids[2]}/highlights`, {
  quote,
  prefix: text.slice(Math.max(0, start - 30), start),
  suffix: text.slice(end + 1, end + 31),
  color: 'yellow',
});
console.log('highlight created:', JSON.stringify(quote.slice(0, 60)));

// 4. Browser: inject the session cookie, capture shots
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const sessionCookies = cookie.split('; ').map((c) => {
  const eq = c.indexOf('=');
  return { name: c.slice(0, eq), value: c.slice(eq + 1), domain: 'localhost', path: '/' };
});

async function shot(colorScheme, path, file, waitSel) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme });
  await ctx.addCookies(sessionCookies);
  const page = await ctx.newPage();
  await page.goto(`${WEB}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(waitSel, { timeout: 30000 });
  await page.waitForTimeout(2500); // images/fonts settle
  await page.screenshot({ path: `${OUT}/${file}` });
  await ctx.close();
  console.log('captured', file);
}

// warm-up hit (Vite dep optimization on cold web container)
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${WEB}/welcome`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await ctx.close();
}

await shot('light', '/library', 'library.png', '.app-item-card');
await shot('light', `/items/${ids[2]}`, 'reader.png', '.page-detail');
await shot(
  'light',
  `/save?url=${encodeURIComponent('https://en.wikipedia.org/wiki/EPUB')}`,
  'save.png',
  '.page-save__card',
);
await shot('dark', '/library', 'library-dark.png', '.app-item-card');

await browser.close();
console.log('DONE');
```

- [ ] **Step 2: Run it**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && node /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/cbb5d84e-aad7-4c2d-a5bc-338d49fccac7/scratchpad/capture-shots.mjs
```

Expected: `signed up … / 3 articles saved + auto-extracted / highlight created … / captured library.png / captured reader.png / captured save.png / captured library-dark.png / DONE`. If a `waitForSelector` times out, re-run once (cold Vite); if sign-up 4xxs because the email exists, the timestamped email makes collisions unlikely — re-run.

- [ ] **Step 3: Verify the images visually**

Open all four PNGs with the Read tool. Check: library shows 3 item cards with titles/covers/tags in LIGHT theme; reader shows the essay with a visible yellow highlight (if no highlight is visible, adjust the quote-picking window in the script and re-run — do not ship a reader shot without a highlight); save shows the success card; library-dark is genuinely dark (dark background, light text) and shows the header theme toggle. Check sizes:

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && ls -la assets/screenshots/
```

Expected: 4 files, each roughly 50–300 KB. Delete the obsolete mockup render:

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git rm assets/screenshots/welcome.png
```

- [ ] **Step 4: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add assets/screenshots && git commit -m "docs(assets): real app screenshots — library, reader+highlight, save, dark theme

Replaces the design-mockup renders; adds library-dark.png, drops welcome.png.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: README content refresh

**Files:**

- Modify: `README.md`
- Create (scratchpad, not committed): `<scratchpad>/check-readme-links.mjs`

**Interfaces:**

- Consumes: the 4 screenshot files from Task 2 (exact names: `library.png`, `reader.png`, `save.png`, `library-dark.png`).
- Produces: the final README; nothing downstream.

Apply the following edits IN PLACE (current README last touched 2026-06-15; anchor text below is exact). Everything not listed stays untouched.

- [ ] **Step 1: Status blockquote**

Replace the whole `> Status: …` blockquote (currently "P1–P5 shipped … Native Kobo store-protocol sync is a documented fast-follow.") with:

```md
> Status: **P1–P6 shipped** — save/organise, extraction/reader/highlights/
> full-text search, capture surfaces, Kobo (OPDS **and native store-protocol
> sync with reading-state write-back**), Obsidian export, dark theme, and
> **auto-extraction on save**. One honest ceiling remains: native sync is
> verified against a full protocol simulation, with the physical-device pass
> still pending (needs HTTPS in front). See the [roadmap](#roadmap).
```

- [ ] **Step 2: Screenshots grid**

Replace the screenshots table + `<sub>` caption with:

```md
|                                                                                 |                                                                     |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Library**                                                                     | **Reader**                                                          |
| ![Library — saved items, filters, tags, covers](assets/screenshots/library.png) | ![Clean reader view with highlights](assets/screenshots/reader.png) |
| **Save from anywhere**                                                          | **Dark theme**                                                      |
| ![Quick save via the /save capture page](assets/screenshots/save.png)           | ![Library in dark mode](assets/screenshots/library-dark.png)        |

<sub>Live screenshots of the running app (seeded demo library).</sub>
```

- [ ] **Step 3: Save & organise section**

After the "Live metadata:" bullet, insert:

```md
- **Auto-extraction on save** — every saved article is extracted in the
  background automatically, so the reader view, OPDS feed, and Kobo sync are
  ready without another tap (pre-existing libraries are backfilled once).
```

At the end of the same section (after the "Filtered, searchable list" bullet), append:

```md
- **Light & dark themes** — a one-tap toggle in the header plus a
  system/light/dark preference in Settings.
```

- [ ] **Step 4: Read & highlight section**

Replace the first bullet's opening `- **On-demand full-article extraction** (Readability + sanitisation) into a` with:

```md
- **Automatic full-article extraction** (Readability + sanitisation) into a
```

and append to that same bullet, after "kept even if the original goes dark.": ` A manual re-extract button covers pages that need a retry.`

- [ ] **Step 5: Sync & export — Kobo bullet**

Replace the single `- **Kobo sync** (S4): …` bullet (ends with "…needs a physical device to verify).\_") with:

```md
- **Kobo sync** (S4 + P6) — two tiers, both served straight from your library,
  no firmware hacking:
  - **OPDS catalog** (`GET /api/v1/opds`) with covers, cursor pagination, and
    OpenSearch, plus EPUB/KEPUB generation
    (`GET /api/v1/items/{id}/epub`). Add it on a stock Kobo via Settings →
    "Add an OPDS catalog".
  - **Native store-protocol sync** (`/api/v1/kobo/{token}/*` — the token
    rides in the URL path because the Kobo's browser can't send auth
    headers): the device pulls new articles automatically on connect, and
    reading state writes back (finish a piece on the Kobo → it's `read` in
    burkmak; archive in the app → it disappears from the device). Point
    `api_endpoint` in `Kobo eReader.conf` at
    `https://<your-host>/api/v1/kobo/<PAT>` — HTTPS required by the device.
    _Verified against a full store-protocol simulation; the physical-device
    pass is the one remaining ceiling._
```

- [ ] **Step 6: Roadmap table + intro**

In the roadmap intro paragraph, replace `Phase order: **S0 → S1 → S2**, then **S3 / S4 / S5** in parallel.` with `Phase order: **S0 → S1 → S2**, then **S3 / S4 / S5** in parallel, then a **P6** polish wave.` Add a row to the roadmap table after P5:

```md
| **P6** | polish | Native Kobo store sync + read-state write-back · OPDS covers/pagination/search · dark theme + switcher · auto-extract on save | ✅ shipped |
```

Also fix the now-stale P4 row: change `OPDS catalog + EPUB/KEPUB download (native store sync: follow-up)` to `OPDS catalog + EPUB/KEPUB download`.

- [ ] **Step 7: Architecture mermaid**

Inside the `subgraph clients` block, after the `mobile[…]` line, add:

```
    kobo["Kobo e-reader<br/><sub>stock device</sub>"]
```

After the `mobile -->|"app_api_client (dart)"| api` edge, add:

```
  kobo -->|"OPDS + Kobo store API"| api
```

- [ ] **Step 8: Link check**

Create `<scratchpad>/check-readme-links.mjs`:

```js
// Verifies every relative link/image in README.md points at an existing path.
import { readFileSync, existsSync } from 'node:fs';

const md = readFileSync('README.md', 'utf8');
const refs = [...md.matchAll(/\]\(([^)#][^)]*)\)/g)]
  .map((m) => m[1])
  .filter((p) => !/^[a-z]+:\/\//.test(p) && !p.startsWith('mailto:') && !p.startsWith('<'));
const missing = refs.filter((p) => !existsSync(p.split('#')[0]));
if (missing.length) {
  console.error('MISSING:', missing);
  process.exit(1);
}
console.log(`OK — ${refs.length} relative refs all exist`);
```

Run it:

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && node /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/cbb5d84e-aad7-4c2d-a5bc-338d49fccac7/scratchpad/check-readme-links.mjs
```

Expected: `OK — <N> relative refs all exist`. If MISSING lists anything, fix the link (or the missed file) before continuing.

- [ ] **Step 9: Format + commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm format && git add README.md && git commit -m "docs(readme): P6 shipped — native Kobo sync, OPDS polish, dark theme, auto-extract

Status/features/roadmap/architecture refreshed; screenshots grid now uses
the real app captures incl. dark theme.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(If `pnpm format` touches files other than README.md, leave them uncommitted and mention it in your report.)

---

### Task 4: Tidy — delete merged stale branches, close the task entry

**Files:**

- Modify: `specs/tasks/active.md` (check boxes)

**Interfaces:** n/a — terminal housekeeping.

- [ ] **Step 1: Verify and delete the three merged branches**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && for b in chore/prettier-ignore-generated feat/s2-backend feat/s2-design; do git merge-base --is-ancestor "$b" main && git branch -d "$b" && echo "deleted $b"; done && git branch
```

Expected: three `deleted …` lines; `git branch` then lists only `main` and `docs/readme-refresh`. `git branch -d` (lowercase) refuses unmerged branches — if it refuses, STOP and report; do not force with `-D`.

- [ ] **Step 2: Check all four sub-step boxes in `specs/tasks/active.md`** (Status stays `in-progress` until merge), run `cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm format`, then commit:

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add specs/tasks/active.md && git commit -m "docs(tasks): T-2026-07-13-002 sub-steps done — shots, README, links, branches

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Out of scope for this plan

- Merging to `main` / archiving to `done.md` — after user review (`--no-ff` per repo convention).
- CI badge, GitHub repo description/topics — delivered as suggestions in the controller's final report.
- Any change under `apps/`, `packages/`, `docker/`, or `.github/`.
