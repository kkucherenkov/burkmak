import base from '@app/eslint-config/base.mjs';

export default [
  ...base,
  {
    ignores: ['src/generated/**', 'src/realtime/channels.ts', 'dist/**', 'node_modules/**'],
  },
];
