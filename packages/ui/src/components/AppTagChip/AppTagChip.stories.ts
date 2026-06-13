import type { Meta, StoryObj } from '@storybook/vue3';

import AppTagChip from './AppTagChip.vue';

const meta: Meta<typeof AppTagChip> = {
  title: 'Compositions/AppTagChip',
  component: AppTagChip,
  tags: ['autodocs'],
  args: { label: 'design' },
  argTypes: {
    label: { control: 'text' },
    selected: { control: 'boolean' },
    removable: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof AppTagChip>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Removable: Story = {
  args: { removable: true },
};

export const AllStates: Story = {
  render: () => ({
    components: { AppTagChip },
    setup: () => ({
      states: [
        { label: 'default', selected: false, removable: false },
        { label: 'selected', selected: true, removable: false },
        { label: 'removable', selected: false, removable: true },
        { label: 'selected + removable', selected: true, removable: true },
      ],
    }),
    template: `<div style="display:flex; gap: var(--space-2);">
      <AppTagChip
        v-for="s in states"
        :key="s.label"
        :label="s.label"
        :selected="s.selected"
        :removable="s.removable"
      />
    </div>`,
  }),
};
