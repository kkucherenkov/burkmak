# Generating burkmak's design bundle with Open Design

[Open Design](https://github.com/nexu-io/open-design) drives your local Claude
Code as a design engine. Its defaults (HTML artifacts, Markdown design systems)
do **not** match this repo's contract (`specs/design/tokens/*.json` DTCG +
`mockups/*.tsx` → `pnpm design:build`), so this kit steers it to emit the right
format. After generation, reconcile into the repo (see last section).

## 1. Install & run Open Design

```sh
# clone Open Design somewhere OUTSIDE this repo
git clone https://github.com/nexu-io/open-design.git
cd open-design
corepack enable
pnpm install
pnpm tools-dev run web        # web UI in the foreground
# (or: pnpm tools-dev          # background daemon + desktop shell)
```

On first load it auto-detects installed CLIs and picks **Claude Code**. Verify
in **Settings → Execution mode → Local CLI**. If none detected, ensure
`claude` is on your PATH.

## 2. Register the burkmak design system

Copy this repo's brand file into Open Design's systems folder:

```sh
mkdir -p <open-design>/design-systems/burkmak
cp <burkmak>/specs/design/DESIGN.md <open-design>/design-systems/burkmak/DESIGN.md
```

Then pick **burkmak** from the **Design system** dropdown. (Open Design's
built-in **"Warm Editorial"** is a close fallback if you want to start there.)

## 3. Install the output-contract skill

Open Design skills live in `<open-design>/skills/<name>/SKILL.md` and define the
**output rules**. Create `skills/burkmak-repo-bundle/SKILL.md` with:

````md
# Skill: burkmak-repo-bundle

Produce design artefacts that drop into a spec-first monorepo with NO manual
reformatting. Always output BOTH kinds below as real files.

## 1. Design tokens — W3C DTCG JSON
Write/extend these files (overwrite, keep filenames):
- color.json, typography.json, spacing.json, radius.json, shadow.json,
  motion.json, opacity.json
Token shape: { "$value": "...", "$type": "color"|"dimension"|"duration"|... }.
Themeable tokens wrap values: { "light": {...}, "dark": {...} } — EVERY color
has both light and dark. No hex outside token JSON. No Tailwind names.
Match the category layout already in this repo's tokens (brand/surface/border/
text/status; font.family/weight/size/tracking/leading + role; space; radius
sm/md/lg/xl/full; shadow elevation light+dark; motion duration/easing + zIndex;
opacity). Use the palette/typography in the burkmak DESIGN.md verbatim.

## 2. Mockups — self-contained TSX, one file per screen
- kebab-case route name: library.tsx, sign-in.tsx, …
- React only, no imports besides React.
- Style ONLY via CSS variables from the tokens:
  color→var(--brand-accent)/var(--text-fg)/var(--surface-page); spacing→var(--space-4);
  radius→var(--radius-md); shadow→var(--shadow-md); motion→var(--duration-base).
  NO hex, NO px literals, NO Tailwind, NO inline style={{}} with raw values.
- BEM class names prefixed app-<name>: .app-item-card, .app-item-card__title.
- Include every state: default/hover/focus-visible/active/disabled/
  loading(skeleton)/empty/error PLUS item states pending/extracting/ready/failed.
- Render both light and dark (two files or a [data-theme='dark'] variant).

## Output location
Write tokens to specs/design/tokens/ and mockups to specs/design/mockups/ in the
target repo. Also emit a short README.md (screens, decisions, open questions).
````

Pick **burkmak-repo-bundle** from the **Skill** dropdown.

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

**MVP screens (S0–S1) — do these first**
```
welcome.tsx — first-run hero: burkmak value prop (save · read · sync to Kobo ·
export to Obsidian), one primary "Get started" CTA, calm editorial layout,
Fraunces display headline. Light + dark.
```
```
sign-in.tsx and sign-up.tsx — minimal centered auth cards, AppInput/AppField/
AppButton, error + loading states. Light + dark.
```
```
library.tsx — the core list. AppFilterBar (Unread/Read/Archived/★ segmented +
tag filter + search). List of AppItemCard (favicon, title, site+time meta,
2-line excerpt, tag chips, AppStatusBadge, hover actions). Show ALL states:
skeleton loading, empty, populated, and one card mid-fetch in the "pending"
state. Light + dark.
```
```
add-link.tsx — paste-a-URL quick add, both as an inline bar and a modal/sheet;
show validating + just-saved(pending) states. Light + dark.
```
```
item-detail.tsx — single item: metadata, tags (add/remove), read-state +
favorite controls, and a prominent "Fetch full article" action with its
pending/extracting/ready/failed states. Light + dark.
```

**Near-term screens (S2+) — for coherence, optional now**
```
reader.tsx, highlights.tsx, tags.tsx, settings.tsx, settings-kobo.tsx,
settings-obsidian.tsx — per the burkmak DESIGN.md component list. Light + dark.
```

## 5. Reconcile into the repo

After Open Design writes files (or HTML artifacts in `.od/artifacts/…` if the
skill didn't fully take), bring them home:

1. `tokens/*.json` → `specs/design/tokens/` (overwrite, keep filenames).
2. `mockups/*.tsx` → `specs/design/mockups/`.
3. README → append to `specs/design/mockups/README.md`.
4. `pnpm install` (first time) then `pnpm design:build`; verify in
   `pnpm storybook`.
5. Commit tokens + generated artefacts together.

> If Open Design emits HTML instead of the token-JSON + TSX contract, hand the
> output back to me — I'll convert it into the exact `tokens/*.json` +
> `mockups/*.tsx` the pipeline expects. The DESIGN.md palette is the source of
> truth, so reconciliation is mechanical.

**Note on fonts:** the DESIGN.md adds `serif`/`display` families (Literata,
Fraunces) and a `readerBody` role beyond the template's `sans`/`mono`. Before
relying on them in generated CSS, confirm the token emitter
(`packages/design-tokens/src/emit-scss.ts`) handles the extra family keys; if
not, extend the emitter (don't hardcode the font in components).
