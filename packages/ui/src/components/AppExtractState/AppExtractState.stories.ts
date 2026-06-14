import type { Meta, StoryObj } from '@storybook/vue3';

import AppExtractState from './AppExtractState.vue';

const meta: Meta<typeof AppExtractState> = {
  title: 'Compositions/AppExtractState',
  component: AppExtractState,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['none', 'extracting', 'ready', 'failed'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof AppExtractState>;

const labels = {
  pitch: 'Read it here, clean',
  extract: 'Fetch full article',
  extracting: 'Extracting…',
  failed: "We couldn't fetch this article",
  retry: 'Try again',
};

export const None: Story = {
  args: {
    status: 'none',
    labels,
  },
};

export const Extracting: Story = {
  args: {
    status: 'extracting',
    labels,
  },
};

export const Failed: Story = {
  args: {
    status: 'failed',
    labels,
  },
};
