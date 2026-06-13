# Mockups

Per-screen design references for building the real `@app/ui` Vue components and
Nuxt pages. For each screen we keep **two files**:

- **`<screen>.vue`** — Vue 3 SFC (`<script setup>` + scoped SCSS, BEM `app-*`),
  near drop-in for `packages/ui`. Styles only via the canonical token variables.
- **`<screen>.html`** — a self-contained viewable copy. Open it directly in a
  browser; it links `../tokens.preview.css` (B palette / A taxonomy) and the
  brand fonts, and renders **light + dark** with every state.

## Conventions

- Style only via canonical tokens (`var(--brand-accent)`, `var(--surface-page)`,
  `var(--text-fg)`, `var(--radius-lg)`, `var(--space-4)`, …) — no hex / px /
  Tailwind / inline literal styles.
- BEM class names prefixed `app-`; the `.vue` carries `<!-- @app/ui: AppX -->`
  comments marking which primitive each block becomes.
- Each screen renders both themes and all relevant states.

## How these are generated (hybrid Open Design flow)

Generation is driven over the Open Design daemon REST API (`POST /api/chat`,
skill `burkmak-repo-bundle`, design system `burkmak`), which spawns Claude to
produce `.vue` + `.html` into the OD project; the chosen screens are then
reconciled here. See `../open-design/README.md`.

## Screens

| Screen        | `.vue` | `.html` | Notes |
| ------------- | :----: | :-----: | ----- |
| library       | ✅     | ✅      | core list: AppFilterBar + AppItemCard list; states: skeleton / empty / populated / pending / extracting / ready / failed; light + dark |
| welcome       | —      | —       | next |
| sign-in / sign-up | — | —       | next (replacing the earlier React drafts) |
| add-link      | —      | —       | next |
| item-detail   | —      | —       | next |

> Viewing: open `library.html` in a browser. `library.vue` is the build
> reference for the eventual `packages/ui` components.
