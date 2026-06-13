# Mockups

Drop JSX / TSX mockups produced by Claude Design here — one file per screen
or flow. They are the visual contract that Claude Code consumes when
building the actual `@app/ui` components and Nuxt pages.

Suggested conventions:

- One `.tsx` per screen, named after the route (`home.tsx`, `sign-in.tsx`)
- Use semantic tokens (`var(--brand-accent)`, `var(--text-fg)`) not hex
- Keep each mockup self-contained — the renderer wraps them with the
  repo's global tokens stylesheet automatically

This directory is intentionally empty in the upstream template; replace
`.gitkeep` with your real files once you have them.
