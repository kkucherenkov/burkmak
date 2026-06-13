import type { Meta, StoryObj } from '@storybook/vue3';

import AppSkeleton from './AppSkeleton.vue';

const meta: Meta<typeof AppSkeleton> = {
  title: 'Compositions/AppSkeleton',
  component: AppSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'title', 'meta', 'avatar', 'image'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof AppSkeleton>;

export const Default: Story = {
  args: { variant: 'text' },
};

export const Card: Story = {
  render: () => ({
    components: { AppSkeleton },
    setup: () => ({}),
    template: `
      <div style="display:flex; flex-direction:column; gap: var(--space-2); width: 20rem;">
        <AppSkeleton variant="avatar" />
        <AppSkeleton variant="title" />
        <AppSkeleton variant="meta" />
        <AppSkeleton variant="text" />
        <AppSkeleton variant="text" />
      </div>
    `,
  }),
};
