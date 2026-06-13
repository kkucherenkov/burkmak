import AppButton from './AppButton.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof AppButton> = {
  title: 'Primitives/AppButton',
  component: AppButton,
  tags: ['autodocs'],
  args: { label: 'Submit' },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost', 'link'] },
    color: { control: 'select', options: ['primary', 'neutral', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    block: { control: 'boolean' },
    icon: {
      control: 'text',
      description: 'Iconify name rendered via AppIcon, aligned left of the label.',
    },
    iconTrailing: {
      control: 'text',
      description: 'Iconify name rendered via AppIcon, aligned right of the label.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof AppButton>;

export const Primary: Story = {};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Loading: Story = {
  args: { loading: true },
};

export const WithLeadingIcon: Story = {
  args: { icon: 'i-lucide-check', label: 'Confirm' },
};

export const WithTrailingIcon: Story = {
  args: { iconTrailing: 'i-lucide-arrow-right', label: 'Next' },
};

export const Sizes: Story = {
  render: (args) => ({
    components: { AppButton },
    setup: () => ({ args }),
    template: `
      <div style="display:flex; gap: var(--space-8); align-items:center;">
        <AppButton v-bind="args" size="sm" />
        <AppButton v-bind="args" size="md" />
        <AppButton v-bind="args" size="lg" />
      </div>
    `,
  }),
};
