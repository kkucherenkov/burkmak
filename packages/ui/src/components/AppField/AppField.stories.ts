import AppField from './AppField.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof AppField> = {
  title: 'Primitives/AppField',
  component: AppField,
  tags: ['autodocs'],
  args: { label: 'Email address' },
  argTypes: {
    label: { control: 'text', description: 'Label text. Translated by the consumer.' },
    required: { control: 'boolean' },
    help: {
      control: 'text',
      description: 'Secondary hint below the input. Hidden when `error` is set.',
    },
    error: {
      control: 'text',
      description: 'Error copy; replaces `help` and flips the field into `aria-invalid`.',
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component: [
          'AppField composes AppLabel + input slot + help/error below.',
          '',
          'Consumers spread slot-provided attrs onto their input: `id`, `aria-describedby`, `aria-invalid`, `aria-required`.',
        ].join('\n'),
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AppField>;

const inputStyle =
  'padding: var(--space-4); border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-surface); color: var(--text-fg); font: inherit;';

const singleFieldRender: Story['render'] = (args) => ({
  components: { AppField },
  setup: () => ({ args, inputStyle }),
  template: `
    <AppField v-bind="args">
      <template #default="a">
        <input type="email" v-bind="a" :style="inputStyle" />
      </template>
    </AppField>
  `,
});

export const Default: Story = {
  render: singleFieldRender,
};

export const WithHelp: Story = {
  args: { help: "We'll only use this to send appointment reminders." },
  render: singleFieldRender,
};

export const WithError: Story = {
  args: { error: 'Enter a valid email address.' },
  render: singleFieldRender,
};

export const Required: Story = {
  args: { required: true, help: 'Required to finish booking.' },
  render: singleFieldRender,
};

export const DifferentSizes: Story = {
  render: () => ({
    components: { AppField },
    setup: () => ({ inputStyle }),
    template: `
      <div style="display:flex; flex-direction:column; gap: var(--space-8);">
        <AppField label="Small" size="sm">
          <template #default="a"><input type="text" v-bind="a" :style="inputStyle" /></template>
        </AppField>
        <AppField label="Medium" size="md">
          <template #default="a"><input type="text" v-bind="a" :style="inputStyle" /></template>
        </AppField>
        <AppField label="Large" size="lg">
          <template #default="a"><input type="text" v-bind="a" :style="inputStyle" /></template>
        </AppField>
      </div>
    `,
  }),
};
