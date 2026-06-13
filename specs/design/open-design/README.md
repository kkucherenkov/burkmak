# Generating burkmak's design bundle with Open Design

[Open Design](https://github.com/nexu-io/open-design) drives your local Claude
Code as a design engine. Its defaults (HTML artifacts, Markdown design systems)
do **not** match this repo's contract (`specs/design/tokens/*.json` DTCG +
`mockups/*.tsx` → `pnpm design:build`), so this kit steers it to emit the right
format. After generation, reconcile into the repo (see last section).

## 1. Install & run Open Design

> **Already set up** at `~/projects/petProjects/tools/open-design`
> (cloned, `pnpm install` done on **node 24 via nvm**). To launch:

```sh
cd ~/projects/petProjects/tools/open-design
nvm use 24                    # repo requires node 24 (.node-version)
pnpm tools-dev run web        # web UI in the foreground
# (or: pnpm tools-dev          # background daemon + desktop shell)
```

On first load it auto-detects installed CLIs and picks **Claude Code**. Verify
in **Settings → Execution mode → Local CLI**. If none detected, ensure
`claude` is on your PATH.

## 2. Register the burkmak design system — done

`specs/design/DESIGN.md` is already copied to
`tools/open-design/design-systems/burkmak/DESIGN.md` (a valid legacy
`DESIGN.md`-only system). Pick **burkmak** from the **Design system** dropdown.
(Open Design's built-in **"Warm Editorial"** is a close fallback.)

If you edit `specs/design/DESIGN.md`, re-copy it:

```sh
cp specs/design/DESIGN.md ~/projects/petProjects/tools/open-design/design-systems/burkmak/DESIGN.md
```

## 3. Install the output-contract skill

**Already installed** at
`tools/open-design/skills/burkmak-repo-bundle/SKILL.md`. Pick
**burkmak-repo-bundle** from the **Skill** dropdown.

The skill steers output to, **per screen, a Vue SFC + a viewable HTML copy**
(Open Design can't render `.vue`/`.tsx`, so the `.html` is what its preview
shows), plus the **DTCG token JSON** and a canonical-named `tokens.preview.css`.
Both `.vue` and `.html` use the **template's canonical CSS variable names**
(`--brand-accent`, `--surface-page`, `--text-fg`, …), so the `.vue` is near
drop-in for `@app/ui` and the `.html` renders against the real palette. See the
placed `SKILL.md` for the full output rules.

> The skill was changed after the first auth run (which produced React `.tsx`).
> **Start a fresh run / re-select the skill** so the updated rules load, then
> re-run the auth prompts to get `.vue` + `.html`.

## 4. Per-screen prompts (paste one at a time)

Each run: Skill = `burkmak-repo-bundle`, Design system = `burkmak`, then send.
Do the **tokens** first, then screens.

**Tokens**

```
Emit the full token set (color/typography/spacing/radius/shadow/motion/opacity)
as DTCG JSON per the skill, using the burkmak DESIGN.md palette and typography
exactly (Fraunces display, Literata reading, Hanken Grotesk UI; clay accent;
warm paper light / warm-ink dark). Every color light+dark.
```

Each screen prompt yields **`<screen>.vue` + `<screen>.html`** (both light + dark).

**MVP screens (S0–S1) — do these first**

```
welcome (welcome.vue + welcome.html) — first-run hero: burkmak value prop
(save · read · sync to Kobo · export to Obsidian), one primary "Get started"
CTA, calm editorial layout, Fraunces display headline.
```

```
sign-in and sign-up (.vue + .html each) — minimal centered auth cards,
AppInput/AppField/AppButton, error + loading states.
```

```
library (library.vue + library.html) — the core list. AppFilterBar
(Unread/Read/Archived/★ segmented + tag filter + search). List of AppItemCard
(favicon, title, site+time meta, 2-line excerpt, tag chips, AppStatusBadge,
hover actions). Show ALL states: skeleton loading, empty, populated, and one
card mid-fetch in the "pending" state.
```

```
add-link (add-link.vue + add-link.html) — paste-a-URL quick add, both as an
inline bar and a modal/sheet; show validating + just-saved(pending) states.
```

```
item-detail (item-detail.vue + item-detail.html) — single item: metadata, tags
(add/remove), read-state + favorite controls, and a prominent "Fetch full
article" action with its pending/extracting/ready/failed states.
```

**Near-term screens (S2+) — for coherence, optional now**

```
reader, highlights, tags, settings, settings-kobo, settings-obsidian
(.vue + .html each) — per the burkmak DESIGN.md component list.
```

## 5. Reconcile into the repo

Open Design writes into `.od/projects/ds-burkmak-2/` (and a system copy under
`.od/design-systems/burkmak-2/`). Bring the output home:

1. `tokens.dtcg.json` → split into the 7 `specs/design/tokens/*.json` files
   (color/typography/spacing/radius/shadow/motion/opacity; fold z-index into
   motion). Keep the existing filenames.
2. `*.html` + `tokens.preview.css` → `specs/design/mockups/` (these are the
   viewable copies).
3. `*.vue` → references for building `packages/ui` (`@app/ui`) components in P1.
4. README → append to `specs/design/mockups/README.md`.
5. `pnpm install` (first time) then `pnpm design:build`; verify in
   `pnpm storybook`.
6. Commit tokens + generated artefacts together.

> Open Design generates in its own namespace/format. Hand the output to me and
> I'll reconcile: split the tokens into the 7 template files, normalise the
> mockups onto the canonical variable names, and run the build. The DESIGN.md
> palette is the source of truth, so reconciliation is mechanical.

**Note on fonts:** the DESIGN.md adds `serif`/`display` families (Literata,
Fraunces) and a `readerBody` role beyond the template's `sans`/`mono`. Before
relying on them in generated CSS, confirm the token emitter
(`packages/design-tokens/src/emit-scss.ts`) handles the extra family keys; if
not, extend the emitter (don't hardcode the font in components).
