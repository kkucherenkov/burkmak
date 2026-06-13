import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const openapi = path.resolve(root, 'openapi/openapi.yaml');
const asyncapi = path.resolve(root, 'asyncapi/centrifugo.yaml');

function run(cmd: string): void {
  console.warn(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

run(`pnpm exec redocly lint "${openapi}"`);
run(`pnpm exec asyncapi validate "${asyncapi}"`);

console.warn('\n✓ OpenAPI and AsyncAPI documents are valid.');
