import AppChip from './AppChip.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const COLORS = ['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const;
const VARIANTS = ['solid', 'soft', 'subtle', 'outline'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<typeof AppChip> = {
  title: 'Primitives/AppChip',
  component: AppChip,
  tags: ['autodocs'],
  args: { label: 'Chip' },
  argTypes: {
    label: { control: 'text' },
    color: { control: 'select', options: COLORS },
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
    icon: {
      control: 'text',
      description: 'Optional iconify name (e.g. `i-lucide-check`) rendered on the leading side.',
    },
    dismissible: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof AppChip>;

export const Default: Story = {};

export const AllColors: Story = {
  render: (args) => ({
    components: { AppChip },
    setup: () => ({ args, colors: COLORS }),
    template: `
      <div style="display:grid; grid-template-columns: repeat(3, auto); gap: var(--space-4); align-items:center; justify-content:start;">
        <AppChip v-for="c in colors" :key="c" v-bind="args" :color="c" :label="c" />
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: (args) => ({
    components: { AppChip },
    setup: () => ({ args, colors: COLORS, variants: VARIANTS }),
    template: `
      <div style="display:grid; grid-template-columns: repeat(6, auto); gap: var(--space-4); align-items:center; justify-content:start;">
        <template v-for="v in variants" :key="v">
          <AppChip v-for="c in colors" :key="c + v" v-bind="args" :color="c" :variant="v" :label="c" />
        </template>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: (args) => ({
    components: { AppChip },
    setup: () => ({ args, sizes: SIZES }),
    template: `
      <div style="display:flex; gap: var(--space-4); align-items:center;">
        <AppChip v-for="s in sizes" :key="s" v-bind="args" :size="s" :label="s" />
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  args: {
    icon: 'i-lucide-check',
    color: 'success',
    variant: 'soft',
    label: 'Verified',
  },
};

export const Dismissible: Story = {
  args: {
    dismissible: true,
    color: 'primary',
    variant: 'soft',
    label: 'Filter: In-progress',
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    color: 'primary',
    variant: 'soft',
    label: 'Picked',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    color: 'neutral',
    variant: 'soft',
    label: 'Unavailable',
  },
};
