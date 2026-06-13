import base from '@app/eslint-config/base.mjs';

export default [
  ...base,
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs'],
  },
];
