import type { Meta, StoryObj } from '@storybook/vue3';

import AppShelfRow, { type AppShelfRowData } from './AppShelfRow.vue';

const meta: Meta<typeof AppShelfRow> = {
  title: 'Compositions/AppShelfRow',
  component: AppShelfRow,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppShelfRow>;

const labels = {
  rename: 'Rename',
  delete: 'Delete',
  itemCount: '3 items',
};

const baseShelf: AppShelfRowData = {
  id: 'shf_1',
  name: 'Reading',
  itemCount: 3,
};

export const Default: Story = {
  args: {
    shelf: baseShelf,
    labels,
  },
};

export const Empty: Story = {
  args: {
    shelf: { ...baseShelf, id: 'shf_2', name: 'New shelf', itemCount: 0 },
    labels: { ...labels, itemCount: '0 items' },
  },
};
