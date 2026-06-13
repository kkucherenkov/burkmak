import uiPlugin from '@nuxt/ui/vite';

import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: [
    '../src/foundations/**/*.stories.@(ts|mdx)',
    '../src/components/**/*.stories.@(ts|mdx)',
  ],
  addons: ['@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  typescript: {
    check: false,
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(uiPlugin());
    return viteConfig;
  },
};

export default config;
