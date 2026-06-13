/** @type {import("prettier").Config} */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
  endOfLine: 'lf',
  vueIndentScriptAndStyle: true,
  overrides: [
    {
      files: '*.md',
      options: { proseWrap: 'preserve' },
    },
    {
      files: ['*.yaml', '*.yml'],
      options: { singleQuote: false },
    },
  ],
};
