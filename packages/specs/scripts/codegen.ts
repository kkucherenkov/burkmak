import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const specsRoot = path.resolve(here, '..');
const packagesRoot = path.resolve(specsRoot, '..');

const bundle = path.resolve(specsRoot, 'dist/openapi.json');
const tsOut = path.resolve(packagesRoot, 'api-client-ts/src/generated');
const dartOut = path.resolve(packagesRoot, 'api-client-dart/lib/generated');
const openapiTypesOut = path.resolve(specsRoot, 'src/openapi-types.ts');

if (!existsSync(bundle)) {
  throw new Error(`Missing ${bundle}. Run \`pnpm --filter @app/specs bundle\` first.`);
}

for (const dir of [tsOut, dartOut, path.dirname(openapiTypesOut)]) {
  mkdirSync(dir, { recursive: true });
}

function run(cmd: string, cwd = specsRoot): void {
  console.warn(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

console.warn('[codegen] 1/3 openapi-typescript → @app/specs/openapi-types.ts');
run(`pnpm exec openapi-typescript "${bundle}" --output "${openapiTypesOut}"`);

console.warn('[codegen] 2/3 @hey-api/openapi-ts → @app/api-client-ts');
run(`pnpm exec openapi-ts --input "${bundle}" --output "${tsOut}" --client @hey-api/client-fetch`);

console.warn('[codegen] 3/3 openapi-generator-cli (dart-dio) → @app/api-client-dart');
run(
  [
    'pnpm exec openapi-generator-cli generate',
    `-i "${bundle}"`,
    '-g dart-dio',
    `-o "${dartOut}"`,
    '--additional-properties=pubName=app_api_client,pubLibrary=app_api_client.api,nullableFields=true',
  ].join(' '),
);

// The dart-dio template emits a fixed import block per *_api.dart
// (Problem, built_value/json_object) regardless of whether the operations
// actually reference them, producing analyzer `unused_import` hints. Run
// `dart fix --apply` against the generated package so Dart itself strips
// the unused directives — the source of truth stays the analyzer, no
// in-repo suppressions, no template forks.
console.warn('[codegen] post: dart fix --apply (strip generator-induced unused imports)');
run('dart pub get', dartOut);
run('dart fix --apply', dartOut);

console.warn('[codegen] post: prettier on openapi-types.ts (stable diff across versions)');
run(`pnpm exec prettier --write "${openapiTypesOut}"`, packagesRoot);

console.warn('[codegen] 4/4 asyncapi → @app/api-client-ts/realtime/channels.ts');
run(`node --experimental-strip-types ${path.join(here, 'codegen-asyncapi.ts')}`);

console.warn('[codegen] post: prettier on generated realtime channels');
run(
  `pnpm exec prettier --write "${path.join(packagesRoot, 'api-client-ts/src/realtime/channels.ts')}"`,
  packagesRoot,
);

console.warn('\n✓ Codegen complete.');
