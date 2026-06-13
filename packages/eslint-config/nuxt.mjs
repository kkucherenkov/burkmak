import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tseslint from 'typescript-eslint';

import base from './base.mjs';

export default [
  ...base,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': [
        'error',
        { html: { void: 'always', normal: 'always', component: 'always' } },
      ],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': [
        'error',
        { order: ['defineProps', 'defineEmits', 'defineSlots'] },
      ],
      // CLAUDE.md: inline style="" is banned; use :style with CSS vars or scoped SCSS.
      'vue/no-static-inline-styles': ['error', { allowBinding: true }],
      'vue/no-restricted-static-attribute': [
        'error',
        {
          key: 'style',
          message:
            'Inline style="" is banned (CLAUDE.md). Use :style with a CSS var or a scoped SCSS class.',
        },
      ],
      'vue/no-v-html': 'error',
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/prefer-true-attribute-shorthand': 'error',
      // Template literals ban — force tokens/computeds instead of magic strings in class/style.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "VAttribute[key.name='style'] > VExpressionContainer > Literal[raw=/!important/]",
          message: '!important is banned (CLAUDE.md).',
        },
      ],
    },
  },
];
