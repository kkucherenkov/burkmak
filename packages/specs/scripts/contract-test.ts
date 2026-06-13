import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const openapi = path.resolve(root, 'openapi/openapi.yaml');

const baseUrl = process.env['CONTRACT_TEST_BASE_URL'] ?? 'http://host.docker.internal:3000';

const cmd = [
  'docker run --rm',
  `-v "${openapi}:/spec.yaml:ro"`,
  '--add-host=host.docker.internal:host-gateway',
  'schemathesis/schemathesis:stable',
  'run',
  `--base-url "${baseUrl}"`,
  '--checks all',
  '--hypothesis-max-examples=25',
  '/spec.yaml',
].join(' ');

console.warn(`\n$ ${cmd}`);
execSync(cmd, { stdio: 'inherit', cwd: root });

console.warn('\n✓ Schemathesis contract tests passed.');
