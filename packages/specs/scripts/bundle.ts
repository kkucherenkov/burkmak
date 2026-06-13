import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const openapi = path.resolve(root, 'openapi/openapi.yaml');
const distDir = path.resolve(root, 'dist');
const bundled = path.resolve(distDir, 'openapi.json');

mkdirSync(distDir, { recursive: true });

const cmd = `pnpm exec redocly bundle "${openapi}" --ext=json --output "${bundled}"`;
console.warn(`\n$ ${cmd}`);
execSync(cmd, { stdio: 'inherit', cwd: root });

console.warn(`\n✓ Bundled OpenAPI → ${bundled}`);
