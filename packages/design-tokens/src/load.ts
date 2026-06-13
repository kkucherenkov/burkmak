import { readFileSync } from 'node:fs';
import path from 'node:path';

import type {
  ColorFile,
  MotionFile,
  OpacityFile,
  RadiusFile,
  ShadowFile,
  SpacingFile,
  TokenBundle,
  TypographyFile,
} from './types.ts';

function readJson(file: string): unknown {
  const raw = readFileSync(file, 'utf8');
  return JSON.parse(raw) as unknown;
}

export function loadTokens(repoRoot: string): TokenBundle {
  const dir = path.join(repoRoot, 'specs/design/tokens');
  return {
    color: readJson(path.join(dir, 'color.json')) as ColorFile,
    typography: readJson(path.join(dir, 'typography.json')) as TypographyFile,
    spacing: readJson(path.join(dir, 'spacing.json')) as SpacingFile,
    radius: readJson(path.join(dir, 'radius.json')) as RadiusFile,
    shadow: readJson(path.join(dir, 'shadow.json')) as ShadowFile,
    motion: readJson(path.join(dir, 'motion.json')) as MotionFile,
    opacity: readJson(path.join(dir, 'opacity.json')) as OpacityFile,
  };
}
