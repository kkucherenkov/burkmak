import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const TS_FILES = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.vue'];
const CONFIG_FILES = [
  '**/*.config.{mjs,cjs,js,ts,mts,cts}',
  '**/eslint.config.{mjs,cjs,js,ts,mts,cts}',
];

export default [
  js.configs.recommended,
  unicorn.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((c) => ({ ...c, files: TS_FILES })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({ ...c, files: TS_FILES })),
  {
    files: TS_FILES,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // eslint-plugin-import@2.32.0 calls sourceCode.getTokenOrCommentAfter
      // which was removed in ESLint 10 — the fixer crashes on any file it
      // reorders. Disable until eslint-plugin-import-x migration.
      'import/order': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': ['error', { cases: { kebabCase: true, pascalCase: true } }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': ['error', { cases: { kebabCase: true, pascalCase: true } }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: CONFIG_FILES,
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: [
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '**/*.story.ts',
      '**/*.story.vue',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.e2e-spec.ts',
      '**/.storybook/**/*.{ts,vue}',
      '**/e2e/**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: null,
      },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'unicorn/no-useless-undefined': 'off',
    },
  },
  prettier,
];
