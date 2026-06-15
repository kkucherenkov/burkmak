import base from '@app/eslint-config/base.mjs';

export default [
  ...base,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['main.js', 'esbuild.config.mjs'],
  },
];
