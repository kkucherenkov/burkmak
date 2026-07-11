import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

import AppThemeToggle, { type AppThemeMode } from './AppThemeToggle.vue';

const meta: Meta<typeof AppThemeToggle> = {
  title: 'Components/AppThemeToggle',
  component: AppThemeToggle,
  tags: ['autodocs'],
  parameters: {
    a11y: { disable: false },
  },
};
export default meta;
type Story = StoryObj<typeof AppThemeToggle>;

export const Light: Story = {
  args: { mode: 'light' as AppThemeMode, label: 'Toggle theme' },
};

export const Dark: Story = {
  args: { mode: 'dark' as AppThemeMode, label: 'Toggle theme' },
};

/** Interactive: clicking flips the mode, mirroring the consumer wiring. */
export const Interactive: Story = {
  args: { mode: 'light' as AppThemeMode, label: 'Toggle theme' },
  render: (args) => ({
    components: { AppThemeToggle },
    setup() {
      const mode = ref<AppThemeMode>(args.mode);
      function onToggle(): void {
        mode.value = mode.value === 'dark' ? 'light' : 'dark';
      }
      return { args, mode, onToggle };
    },
    template: `<AppThemeToggle :mode="mode" :label="args.label" @toggle="onToggle" />`,
  }),
};
