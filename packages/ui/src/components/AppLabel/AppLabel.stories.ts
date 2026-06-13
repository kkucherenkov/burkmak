import AppLabel from './AppLabel.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof AppLabel> = {
  title: 'Primitives/AppLabel',
  component: AppLabel,
  tags: ['autodocs'],
  args: { text: 'Email address' },
  argTypes: {
    text: { control: 'text', description: 'Visible label text. Translated by the consumer.' },
    required: { control: 'boolean', description: 'Renders the `*` marker after the text.' },
    for: {
      control: 'text',
      description: 'Forwarded to the underlying `<label for="">`; should match an input `id`.',
    },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;

type Story = StoryObj<typeof AppLabel>;

export const Default: Story = {};

export const Required: Story = {
  args: { required: true },
};

export const WithFor: Story = {
  render: (args) => ({
    components: { AppLabel },
    setup: () => ({ args }),
    template: `
      <div style="display:flex; flex-direction:column; gap: var(--space-2);">
        <AppLabel v-bind="args" for="demo-email" />
        <input id="demo-email" type="email" style="padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-default);" />
      </div>
    `,
  }),
  args: { text: 'Email address', for: 'demo-email' },
};
