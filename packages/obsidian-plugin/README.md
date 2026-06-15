# burkmak Obsidian Plugin

Sync your burkmak highlights and notes into your Obsidian vault — one markdown note per article, idempotent by `burkmakId` frontmatter.

## Install

This plugin is not in the Obsidian community store. Install manually or via BRAT.

### Manual install

1. Build the plugin:
   ```sh
   pnpm --filter @app/obsidian-plugin build
   ```
2. Copy `main.js` and `manifest.json` from `packages/obsidian-plugin/` into your vault's plugin folder:
   ```
   <vault>/.obsidian/plugins/burkmak/
   ```
3. Enable **burkmak** in Obsidian Settings → Community Plugins.

### BRAT install

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat).
2. In BRAT settings, add the path to a local plugin folder pointing at `packages/obsidian-plugin/` (after running a build).

## Setup

1. Create a Personal Access Token in burkmak: **Settings → Access Tokens → New token**.
2. In Obsidian, open **Settings → burkmak**:
   - **Base URL** — your burkmak API base URL (e.g. `http://localhost:3000/api/v1`).
   - **Personal Access Token** — the PAT you just created.
   - **Target folder** — vault subfolder for synced notes (default: `burkmak`).
   - **Read state filter** — optionally limit to `unread`, `read`, or `archived`.
   - **Include articles without highlights** — toggle to also sync articles with no highlights.

## Usage

Open the Command Palette (`Ctrl+P` / `Cmd+P`) and run **burkmak: Sync from burkmak**.

A notice confirms how many notes were created or updated. Re-running the command updates existing notes in place (matched by `burkmakId` frontmatter — rename-safe).

## Verification ceiling

The plugin builds and typechecks in the monorepo. In-Obsidian runtime — settings tab rendering, vault writes, the Sync command — is verifiable only inside Obsidian (out of sandbox). The pure business logic (`buildExportUrl`, `parseBurkmakId`) is unit-tested with vitest.

## Development

```sh
# Run unit tests
pnpm --filter @app/obsidian-plugin test

# Typecheck
pnpm --filter @app/obsidian-plugin typecheck

# Lint
pnpm --filter @app/obsidian-plugin lint

# Build (emits main.js — not committed)
pnpm --filter @app/obsidian-plugin build

# Watch mode
pnpm --filter @app/obsidian-plugin dev
```
