import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const openapi = path.resolve(root, 'openapi/openapi.yaml');

function run(cmd: string): void {
  console.warn(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

run(`pnpm exec redocly lint "${openapi}"`);

console.warn('\n✓ OpenAPI document is valid.');
