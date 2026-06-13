import base from './base.mjs';

export default [
  ...base,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: { kebabCase: true },
          ignore: [/\.e2e-spec\.ts$/],
        },
      ],
    },
  },
];
