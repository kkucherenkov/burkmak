# Active tasks

## T-2026-07-11-001 — dark theme fixes + theme switcher in header + tag filter reset

- Created: 2026-07-11
- Owner: claude
- Spec: —
- Goal: no dark-on-dark text in dark mode; theme (light/dark/system) switchable from the layout header and settings page; tag filter can be reset to "all tags".
- Spec diff: none (frontend-only)
- Codegen impact: no
- Sub-steps:
  - [x] audit + fix dark-mode token/style offenders (web + @app/ui): AppChip primary soft/subtle/outline used --brand-accent-fg (on-solid color) → dark-on-dark; --highlight-\* tokens were Storybook-only + light-only → shared @app/ui/theme.css with .dark overrides; color-scheme rules keyed on never-set data-theme → now also .light/.dark classes
  - [x] AppThemeToggle component in @app/ui (story + spec)
  - [x] wire toggle into default layout header + settings page (3-way select); add Settings nav link
  - [x] AppFilterBar: "All tags" option emits null tag (story + spec updated)
  - [x] i18n keys en/ru
  - [x] lint/stylelint/format + tests (249 ui tests, ui+web typecheck)
  - [x] e2e verified in-browser: toggle, settings select persistence, tag filter 2→1→2 cards
- Status: in-progress (awaiting PR)
- Blockers: —
