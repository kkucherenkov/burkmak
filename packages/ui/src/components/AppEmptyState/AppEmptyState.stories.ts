import type { Meta, StoryObj } from '@storybook/vue3';

import AppButton from '../AppButton/AppButton.vue';
import AppEmptyState from './AppEmptyState.vue';

const meta: Meta<typeof AppEmptyState> = {
  title: 'Compositions/AppEmptyState',
  component: AppEmptyState,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppEmptyState>;

export const Default: Story = {
  args: {
    title: 'Nothing here yet',
    description: 'Paste a link to begin.',
  },
};

export const WithAction: Story = {
  render: (args) => ({
    components: { AppEmptyState, AppButton },
    setup: () => ({ args }),
    template: `
      <AppEmptyState v-bind="args">
        <AppButton label="Paste a link" />
      </AppEmptyState>
    `,
  }),
  args: {
    title: 'Nothing here yet',
    description: 'Paste a link to begin.',
  },
};
