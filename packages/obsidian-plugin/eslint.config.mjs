import base from '@app/eslint-config/base.mjs';

export default [
  ...base,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['main.js', 'esbuild.config.mjs'],
  },
];
