import base from '@app/eslint-config/base.mjs';

export default [
  ...base,
  {
    ignores: ['dist/**', 'node_modules/**', 'src/openapi-types.ts', 'eslint.config.mjs'],
  },
];
