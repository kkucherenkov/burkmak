import AppBadge from './AppBadge.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const COLORS = ['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const;
const VARIANTS = ['solid', 'outline', 'soft', 'subtle'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<typeof AppBadge> = {
  title: 'Primitives/AppBadge',
  component: AppBadge,
  tags: ['autodocs'],
  args: { label: 'Badge' },
  argTypes: {
    label: { control: 'text' },
    color: { control: 'select', options: COLORS },
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
    icon: {
      control: 'text',
      description: 'Optional iconify name (e.g. `i-lucide-check`) rendered on the leading side.',
    },
    uppercase: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof AppBadge>;

export const Default: Story = {};

export const AllColors: Story = {
  render: (args) => ({
    components: { AppBadge },
    setup: () => ({ args, colors: COLORS }),
    template: `
      <div style="display:grid; grid-template-columns: repeat(3, auto); gap: var(--space-4); align-items:center; justify-content:start;">
        <AppBadge v-for="c in colors" :key="c" v-bind="args" :color="c" :label="c" />
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: (args) => ({
    components: { AppBadge },
    setup: () => ({ args, colors: COLORS, variants: VARIANTS }),
    template: `
      <div style="display:grid; grid-template-columns: repeat(4, auto); gap: var(--space-4); align-items:center; justify-content:start;">
        <template v-for="v in variants" :key="v">
          <AppBadge v-for="c in colors" :key="c + v" v-bind="args" :color="c" :variant="v" :label="c" />
        </template>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  args: { icon: 'i-lucide-check', color: 'success', label: 'Verified' },
};

export const Uppercase: Story = {
  args: { uppercase: true, color: 'warning', label: 'beta' },
};

export const Sizes: Story = {
  render: (args) => ({
    components: { AppBadge },
    setup: () => ({ args, sizes: SIZES }),
    template: `
      <div style="display:flex; gap: var(--space-4); align-items:center;">
        <AppBadge v-for="s in sizes" :key="s" v-bind="args" :size="s" :label="s" />
      </div>
    `,
  }),
};
