import type { Meta, StoryObj } from '@storybook/vue3';

import AppHighlightPopover from './AppHighlightPopover.vue';

const meta: Meta<typeof AppHighlightPopover> = {
  title: 'Compositions/AppHighlightPopover',
  component: AppHighlightPopover,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppHighlightPopover>;

export const Default: Story = {
  args: {
    labels: { addNote: 'Add note' },
  },
};
