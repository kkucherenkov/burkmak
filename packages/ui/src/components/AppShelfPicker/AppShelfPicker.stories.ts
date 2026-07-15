import type { Meta, StoryObj } from '@storybook/vue3';

import AppShelfPicker, { type AppShelfPickerShelf } from './AppShelfPicker.vue';

const meta: Meta<typeof AppShelfPicker> = {
  title: 'Compositions/AppShelfPicker',
  component: AppShelfPicker,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppShelfPicker>;

const shelves: AppShelfPickerShelf[] = [
  { id: 'shf_1', name: 'Reading' },
  { id: 'shf_2', name: 'Later' },
  { id: 'shf_3', name: 'Research' },
];

const labels = {
  add: 'Add',
  remove: 'Remove',
  empty: 'No shelves yet',
};

export const Default: Story = {
  args: {
    shelves,
    selectedIds: ['shf_1'],
    labels,
  },
};

export const NoneSelected: Story = {
  args: {
    shelves,
    selectedIds: [],
    labels,
  },
};

export const Empty: Story = {
  args: {
    shelves: [],
    selectedIds: [],
    labels,
  },
};
