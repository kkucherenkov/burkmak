import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { emitDart } from './emit-dart.ts';
import { emitScss } from './emit-scss.ts';
import { emitTypescript } from './emit-typescript.ts';
import { loadTokens } from './load.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

const tokens = loadTokens(repoRoot);

const cssContents = emitScss(tokens);

const targets = [
  {
    file: path.resolve(repoRoot, 'apps/web/app/assets/css/tokens.generated.css'),
    contents: cssContents,
    label: 'web CSS',
  },
  {
    file: path.resolve(repoRoot, 'packages/ui/src/tokens.generated.css'),
    contents: cssContents,
    label: 'ui CSS (Storybook)',
  },
  {
    file: path.resolve(repoRoot, 'apps/web/app/design-tokens.generated.ts'),
    contents: emitTypescript(tokens),
    label: 'web TypeScript',
  },
  {
    file: path.resolve(repoRoot, 'packages/ui/src/design-tokens.generated.ts'),
    contents: emitTypescript(tokens),
    label: 'ui TypeScript (Storybook)',
  },
  {
    file: path.resolve(repoRoot, 'packages/ui_flutter/lib/src/theme/tokens.g.dart'),
    contents: emitDart(tokens),
    label: 'mobile Dart',
  },
];

for (const { file, contents, label } of targets) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, contents);
  console.warn(`✓ ${label} → ${path.relative(repoRoot, file)}`);
}
