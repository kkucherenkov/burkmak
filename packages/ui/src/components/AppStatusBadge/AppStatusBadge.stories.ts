import type { Meta, StoryObj } from '@storybook/vue3';

import AppStatusBadge from './AppStatusBadge.vue';

const STATUSES = ['pending', 'ready', 'failed'] as const;

const meta: Meta<typeof AppStatusBadge> = {
  title: 'Compositions/AppStatusBadge',
  component: AppStatusBadge,
  tags: ['autodocs'],
  args: { status: 'ready', label: 'Ready' },
  argTypes: { status: { control: 'select', options: STATUSES }, label: { control: 'text' } },
};
export default meta;
type Story = StoryObj<typeof AppStatusBadge>;

export const Ready: Story = {};
export const AllStatuses: Story = {
  render: (args) => ({
    components: { AppStatusBadge },
    setup: () => ({ args, statuses: STATUSES }),
    template: `<div style="display:flex; gap: var(--space-3);">
      <AppStatusBadge v-for="s in statuses" :key="s" :status="s" :label="s" />
    </div>`,
  }),
};
