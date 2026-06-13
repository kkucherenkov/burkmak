# burkmak — Design System (`DESIGN.md`)

> Brand & visual language for burkmak. Doubles as the **Open Design** system
> file (`design-systems/burkmak/DESIGN.md`) and as the human design reference.
> The token values here map 1:1 onto `specs/design/tokens/*.json` (DTCG) — see
> `open-design/README.md` for the reconciliation workflow.

## Aesthetic direction — "the quiet reading room"

burkmak is a calm, reading-first app, not a busy dashboard. The feeling is a
**warm editorial reading room**: paper-warm by day, low-glare ember-dark by
night. One restrained **clay/terracotta** accent (a reading-lamp warmth), heavy
use of whitespace, a characterful serif for headings and long-form reading, a
clean humanist sans for the app chrome. Nothing shouts; the content (the saved
article) is always the loudest thing on screen.

- **Mood:** unhurried, literary, focused, trustworthy.
- **Dark mode is first-class** — people read at night; the dark theme is warm
  (not blue-black) to reduce glare and feel like ink on dark paper.
- **Differentiation:** most read-it-later apps are cold/blue and utilitarian.
  burkmak is warm, typographic, and book-like.

## Typography

| Role        | Family                | Use                                            |
| ----------- | --------------------- | ---------------------------------------------- |
| Display     | **Fraunces**          | welcome hero, big headlines (optical serif)    |
| Reading     | **Literata**          | reader view article body (screen-tuned serif)  |
| UI / sans   | **Hanken Grotesk**    | app chrome, labels, buttons, lists             |
| Mono        | **JetBrains Mono**    | code, URLs, tokens                             |

All three are open-source (Google Fonts) — fits the self-hosted ethos, no
licensing snags. Never use Inter/Roboto/Arial/system-ui as the brand face.

- Long-form reading uses Literata at generous leading (`1.625`–`1.7`).
- UI text uses Hanken Grotesk; headings may use Fraunces for character.
- Scale follows the template's `typography.json` size ramp (xs…7xl). Add a
  `readerBody` role (size `lg`, family Reading, leading `relaxed`).

## Color palette

Every color has light + dark. Light = warm paper; dark = warm low-glare ink.

### Brand (clay / terracotta — the reading lamp)

| Token          | Light     | Dark      |
| -------------- | --------- | --------- |
| accent         | `#B5491F` | `#E9805A` |
| accentHover    | `#9A3D18` | `#F09A7B` |
| accentActive   | `#7E3213` | `#F4B19A` |
| accentFg       | `#FFFFFF` | `#2A1206` |
| accentSubtle   | `#FBEDE6` | `#3A1C10` |

### Surface (warm paper → warm ink)

| Token   | Light     | Dark      |
| ------- | --------- | --------- |
| page    | `#FAF7F1` | `#14110D` |
| surface | `#F3EEE4` | `#1D1813` |
| raised  | `#FFFFFF` | `#261F18` |
| overlay | `#FFFFFF` | `#1D1813` |

### Border

| Token   | Light     | Dark      |
| ------- | --------- | --------- |
| default | `#E7DFD1` | `#2E261D` |
| strong  | `#D2C7B5` | `#463B2E` |
| focus   | `#B5491F` | `#E9805A` |

### Text (warm ink)

| Token     | Light     | Dark      |
| --------- | --------- | --------- |
| fg        | `#221C15` | `#ECE4D8` |
| secondary | `#5C5247` | `#B3A795` |
| tertiary  | `#8A7E70` | `#837868` |
| disabled  | `#C8BEAD` | `#4A4136` |
| inverse   | `#FAF7F1` | `#14110D` |
| link      | `#B5491F` | `#E9805A` |

### Status (warm-tuned semantic)

| Token         | Light     | Dark      |
| ------------- | --------- | --------- |
| successFg     | `#3F7D3A` | `#86C97F` |
| successSubtle | `#EEF6EC` | `#1B2E19` |
| warningFg     | `#B26B12` | `#E7B45A` |
| warningSubtle | `#FBF1E1` | `#33240C` |
| errorFg       | `#B23A2E` | `#EC8478` |
| errorSubtle   | `#F8E9E6` | `#36140F` |
| infoFg        | `#2E6F8E` | `#6FB6D6` |
| infoSubtle    | `#E9F2F6` | `#0E2733` |

burkmak item states reuse status colors: **pending** = info, **extracting** =
warning, **ready** = success, **failed** = error.

## Spacing, radius, shadow, motion

- **Spacing:** 4px grid, template's `space.0 … space.32`. Reading layouts breathe
  — list rows ≥ `space.4` padding, reader column max-width ~68ch.
- **Radius:** soft, not pill-everything. `sm` 6px, `md` 10px, `lg` 14px,
  `xl` 20px, `full` 9999px. Cards use `lg`; chips/badges use `full`.
- **Shadow:** very soft, warm-tinted, low elevation. The page should feel flat
  and papery; elevation is for overlays/menus only.
- **Motion:** quiet and quick. `fast` 120ms, `base` 200ms, `slow` 320ms,
  easing `standard` cubic-bezier(0.2, 0, 0, 1). Page-load: a single gentle
  staggered fade-up of list rows. No bouncy/springy motion.

## Components (map to `@app/ui`)

Reuse template primitives: `AppButton`, `AppBadge`, `AppChip`, `AppInput`,
`AppSelect`, `AppSwitch`, `AppTextarea`, `AppField`, `AppLabel`, `AppCard`,
`AppIcon`. burkmak compositions to add:

- **AppItemCard** — saved item: favicon, title (Fraunces-ish weight), site +
  saved-time meta, excerpt (2 lines, Literata), tag chips, status badge,
  hover-revealed actions (archive / favorite / delete).
- **AppStatusBadge** — pending / extracting / ready / failed (status colors).
- **AppFilterBar** — read-state segmented control (Unread/Read/Archived/★) +
  tag filter + search input.
- **AppTagChip** — selectable / removable, `full` radius.
- **AppEmptyState** — warm illustration slot + one-line guidance + primary CTA.
- **AppSkeleton** — papery shimmer for loading rows.
- **AppReaderToolbar** — typography size, theme, width controls (reader).
- **AppHighlightPopover** — on text selection: highlight + add note.
- **AppSyncStatus** — Kobo / job sync indicator.

## Brand voice

Plain, warm, literate. Short sentences. Encourage rather than nag ("Nothing
here yet — paste a link to start your library."). Never jargon in the UI.

## Anti-patterns (do not do)

- No cold blue/purple gradient "AI" look. No neon.
- No hex/px/ms literals in components — tokens only (`var(--brand-accent)`, …).
- No Inter/Roboto/system-ui as the brand typeface.
- No dense dashboard chrome; protect whitespace and the reading column.
- No pill-shaped everything; reserve `full` radius for chips/badges/avatars.
- No busy motion; one calm load animation, subtle hovers, nothing springy.
