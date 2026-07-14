import type { Meta, StoryObj } from '@storybook/vue3';

import AppItemCard, { type AppItemCardData } from './AppItemCard.vue';

const meta: Meta<typeof AppItemCard> = {
  title: 'Compositions/AppItemCard',
  component: AppItemCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppItemCard>;

const baseItem: AppItemCardData = {
  id: 'itm_1',
  url: 'https://example.com/a-great-article',
  title: 'A great article about Rust and the web',
  siteName: 'Example',
  excerpt:
    'This article explores the intersection of Rust and modern web development, covering WASM, performance patterns, and tooling.',
  faviconUrl: null,
  leadImageUrl: null,
  status: 'ready',
  readState: 'unread',
  favorite: false,
  tags: ['rust', 'web', 'wasm'],
};

const labels = {
  status: 'Ready',
  favorite: 'Favorite',
  archive: 'Archive',
  delete: 'Delete',
};

export const Ready: Story = {
  args: {
    item: baseItem,
    labels,
  },
};

export const Pending: Story = {
  args: {
    item: {
      ...baseItem,
      id: 'itm_2',
      title: 'Fetching article…',
      excerpt: null,
      status: 'pending',
      tags: [],
    },
    labels: { ...labels, status: 'Pending' },
  },
};

export const Failed: Story = {
  args: {
    item: {
      ...baseItem,
      id: 'itm_3',
      title: 'https://example.com/broken',
      excerpt: null,
      status: 'failed',
      tags: [],
    },
    labels: { ...labels, status: 'Failed' },
  },
};

export const Favorite: Story = {
  args: {
    item: {
      ...baseItem,
      id: 'itm_4',
      favorite: true,
    },
    labels,
  },
};

export const Fresh: Story = {
  args: {
    item: {
      ...baseItem,
      id: 'itm_5',
      title: 'Just saved this link',
      excerpt: 'Brand new — just added to the library.',
      tags: ['new'],
    },
    labels,
    fresh: true,
  },
};

export const Bookmark: Story = {
  args: {
    item: {
      ...baseItem,
      id: 'itm_6',
      title: 'A handy CLI reference',
      excerpt: 'Reference link — opens at its source, never enters the reading queue.',
      tags: ['tool'],
    },
    labels,
    variant: 'bookmark',
  },
};
