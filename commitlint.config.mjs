/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'root',
        'specs',
        'api-client-ts',
        'api-client-dart',
        'ui',
        'storybook',
        'backend',
        'web',
        'mobile',
        'docker',
        'ci',
        'claude',
        'deps',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'body-max-line-length': [1, 'always', 120],
  },
};
