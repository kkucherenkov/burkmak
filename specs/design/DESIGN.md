# burkmak — Design System (`DESIGN.md`)

> Brand & visual language for burkmak. Doubles as the **Open Design** system
> file (`design-systems/burkmak/DESIGN.md`) and the human design reference.
> The values here map 1:1 onto `specs/design/tokens/*.json` (DTCG) and
> `specs/design/tokens.preview.css`.
>
> **Palette decision (2026-06-13):** colors from **B** (the refined coral
> rewrite, accent `#d66f4d`); token **taxonomy from A** (the template's
> canonical roles + variable names: `brand.accent`, `surface.page`, `text.fg`,
> `--brand-accent`, …). Roles A defines but B did not (`accentActive`,
> `*Subtle`, `border.strong`, `text.tertiary/disabled/inverse`) are derived
> within B's hue family. Non-color scales (spacing, radius, type ramp) follow
> A. See `open-design/README.md` for the reconcile workflow.

## Aesthetic direction — "the quiet reading room"

burkmak is a calm, reading-first app, not a busy dashboard. A **warm editorial
reading room**: paper-warm by day, low-glare ember-dark by night. One restrained
**clay / terracotta** accent (a reading-lamp warmth), heavy whitespace, a
characterful serif for headings and long-form reading, a clean humanist sans for
the app chrome. Nothing shouts; the saved article is always the loudest thing on
screen. Dark mode is first-class and warm (ink-on-dark-paper, never blue-black).
Most read-it-later apps are cold/blue and utilitarian — burkmak is warm,
typographic, and book-like.

## Typography

| Role        | Family                | Use                                            |
| ----------- | --------------------- | ---------------------------------------------- |
| Display     | **Fraunces**          | welcome hero, big headlines (optical serif)    |
| Reading     | **Literata**          | reader view article body (screen-tuned serif)  |
| UI / sans   | **Hanken Grotesk**    | app chrome, labels, buttons, lists             |
| Mono        | **JetBrains Mono**    | code, URLs, tokens                             |

All open-source (Google Fonts) — fits the self-hosted ethos. Never use
Inter/Roboto/Arial/system-ui as the brand face. Long-form reading uses Literata
at generous leading (`1.625`–`1.7`); add a `readerBody` role (size `lg`, family
Reading, leading `relaxed`).

## Color palette (B values · A taxonomy)

Every color has light + dark. Light = warm paper; dark = warm low-glare ink.

### Brand (clay / terracotta — the reading lamp)

| Role (A)       | Light     | Dark      | Source     |
| -------------- | --------- | --------- | ---------- |
| accent         | `#D66F4D` | `#E2845F` | B          |
| accentHover    | `#C25F3E` | `#EC9772` | B          |
| accentActive   | `#A94E2C` | `#F2B79E` | derived    |
| accentFg       | `#FFFFFF` | `#2A1206` | B (on)     |
| accentSubtle   | `#F6E3DA` | `#3A1C10` | B (soft)   |

### Surface (warm paper → warm ink)

| Role (A) | Light     | Dark      | Source            |
| -------- | --------- | --------- | ----------------- |
| page     | `#FBFAF7` | `#15130F` | B background      |
| surface  | `#F4F1EC` | `#211D17` | B surface-muted   |
| raised   | `#FFFFFF` | `#1D1A15` | B surface         |
| overlay  | `#FFFFFF` | `#1D1A15` | B surface         |

### Border

| Role (A) | Light     | Dark      | Source   |
| -------- | --------- | --------- | -------- |
| default  | `#DDD8D0` | `#322C23` | B        |
| strong   | `#CABFAE` | `#463E30` | derived  |
| focus    | `#D66F4D` | `#E2845F` | B accent |

### Text (warm ink)

| Role (A)  | Light     | Dark      | Source         |
| --------- | --------- | --------- | -------------- |
| fg        | `#1F1D1B` | `#ECE6DB` | B foreground   |
| secondary | `#706B65` | `#A59C8F` | B muted        |
| tertiary  | `#9A938A` | `#837A6C` | derived        |
| disabled  | `#C4BDB2` | `#4A4338` | derived        |
| inverse   | `#FBFAF7` | `#15130F` | derived        |
| link      | `#D66F4D` | `#E2845F` | B accent       |

### Status (warm-tuned; `*Fg` from B, `*Subtle` derived)

| Role (A)      | Light     | Dark      | Item state |
| ------------- | --------- | --------- | ---------- |
| successFg     | `#5D8F5A` | `#7FAE79` | ready      |
| warningFg     | `#B26B12` | `#E7B45A` | extracting |
| errorFg       | `#B23A2E` | `#EC8478` | failed     |
| infoFg        | `#2E6F8E` | `#6FB6D6` | pending    |

Each `*Fg` has a paired `*Subtle` fill (see `tokens/color.json`).

## Spacing, radius, shadow, motion (A / template scales)

- **Spacing:** 4px grid, `space.0 … space.24`. Reading layouts breathe — list
  rows ≥ `space.4` padding; reader column max-width ~68ch.
- **Radius (template taxonomy):** `none/xs/sm/md/lg/xl/2xl/3xl/pill`. Cards use
  `lg`/`xl`; chips, badges, avatars use `pill`. (B's softer radii are a possible
  later tweak; taxonomy + values currently follow A.)
- **Shadow:** very soft, warm-tinted, low elevation. The page is flat and
  papery; reserve elevation for overlays/menus.
- **Motion:** quiet and quick. `fast` 120ms, `base` 200ms, `slow` 320ms; easing
  `standard` cubic-bezier(0.2, 0, 0, 1). One gentle staggered fade-up on load.
  No bouncy/springy motion.

## Components (map to `@app/ui`)

Reuse: `AppButton`, `AppBadge`, `AppChip`, `AppInput`, `AppSelect`, `AppSwitch`,
`AppTextarea`, `AppField`, `AppLabel`, `AppCard`, `AppIcon`. burkmak adds:

- **AppItemCard** — saved item: favicon, title (Fraunces weight), site +
  saved-time meta, 2-line Literata excerpt, tag chips, status badge,
  hover-revealed actions (archive / favorite / delete).
- **AppStatusBadge** — pending / extracting / ready / failed.
- **AppFilterBar** — read-state segmented control + tag filter + search.
- **AppTagChip** — selectable / removable, `pill` radius.
- **AppEmptyState**, **AppSkeleton** (papery shimmer), **AppReaderToolbar**,
  **AppHighlightPopover**, **AppSyncStatus**.

## Brand voice

Plain, warm, literate. Short sentences. Encourage rather than nag — "Nothing
here yet — paste a link to start your library." Never jargon in the UI.

## Anti-patterns

- No cold blue/purple "AI" gradient look. No neon.
- No hex / px / ms literals in components — tokens only (`var(--brand-accent)`,
  `var(--surface-page)`, …).
- No Inter / Roboto / system-ui as the brand face (Fraunces / Literata / Hanken).
- No dense dashboard chrome; protect whitespace and the reading column.
- No pill-shaped everything; reserve `pill` radius for chips / badges / avatars.
- No busy motion; one calm load animation, subtle hovers, nothing springy.
