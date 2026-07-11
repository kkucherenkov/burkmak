import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

import AppFilterBar, { type AppFilterSegment } from './AppFilterBar.vue';

const meta: Meta<typeof AppFilterBar> = {
  title: 'Compositions/AppFilterBar',
  component: AppFilterBar,
  tags: ['autodocs'],
  parameters: {
    a11y: { disable: false },
  },
};
export default meta;
type Story = StoryObj<typeof AppFilterBar>;

const allTagOptions = [
  { id: 'rust', label: 'rust' },
  { id: 'typescript', label: 'typescript' },
  { id: 'vue', label: 'vue' },
];

const baseLabels = {
  unread: 'Unread',
  read: 'Read',
  archived: 'Archived',
  favorite: 'Favorite',
  allTags: 'All tags',
  search: 'Search library',
};

export const Default: Story = {
  args: {
    segment: 'unread' as AppFilterSegment,
    q: '',
    tag: null,
    tagOptions: [],
    labels: baseLabels,
  },
  render: (args) => ({
    components: { AppFilterBar },
    setup() {
      const segment = ref<AppFilterSegment>(args.segment);
      const q = ref(args.q);
      const tag = ref<string | null>(args.tag);
      return { args, segment, q, tag };
    },
    template: `
      <AppFilterBar
        :segment="segment"
        :q="q"
        :tag="tag"
        :tagOptions="args.tagOptions"
        :labels="args.labels"
        @update:segment="segment = $event"
        @update:q="q = $event"
        @update:tag="tag = $event"
      />
    `,
  }),
};

export const FavoriteActive: Story = {
  args: {
    segment: 'favorite' as AppFilterSegment,
    q: '',
    tag: null,
    tagOptions: [],
    labels: baseLabels,
  },
  render: (args) => ({
    components: { AppFilterBar },
    setup() {
      const segment = ref<AppFilterSegment>(args.segment);
      const q = ref(args.q);
      const tag = ref<string | null>(args.tag);
      return { args, segment, q, tag };
    },
    template: `
      <AppFilterBar
        :segment="segment"
        :q="q"
        :tag="tag"
        :tagOptions="args.tagOptions"
        :labels="args.labels"
        @update:segment="segment = $event"
        @update:q="q = $event"
        @update:tag="tag = $event"
      />
    `,
  }),
};

export const WithTags: Story = {
  args: {
    segment: 'unread' as AppFilterSegment,
    q: '',
    tag: null,
    tagOptions: allTagOptions,
    labels: baseLabels,
  },
  render: (args) => ({
    components: { AppFilterBar },
    setup() {
      const segment = ref<AppFilterSegment>(args.segment);
      const q = ref(args.q);
      const tag = ref<string | null>(args.tag);
      return { args, segment, q, tag };
    },
    template: `
      <AppFilterBar
        :segment="segment"
        :q="q"
        :tag="tag"
        :tagOptions="args.tagOptions"
        :labels="args.labels"
        @update:segment="segment = $event"
        @update:q="q = $event"
        @update:tag="tag = $event"
      />
    `,
  }),
};

/** A tag is selected — picking "All tags" in the dropdown clears the filter. */
export const TagSelected: Story = {
  args: {
    segment: 'unread' as AppFilterSegment,
    q: '',
    tag: 'rust',
    tagOptions: allTagOptions,
    labels: baseLabels,
  },
  render: (args) => ({
    components: { AppFilterBar },
    setup() {
      const segment = ref<AppFilterSegment>(args.segment);
      const q = ref(args.q);
      const tag = ref<string | null>(args.tag);
      return { args, segment, q, tag };
    },
    template: `
      <AppFilterBar
        :segment="segment"
        :q="q"
        :tag="tag"
        :tagOptions="args.tagOptions"
        :labels="args.labels"
        @update:segment="segment = $event"
        @update:q="q = $event"
        @update:tag="tag = $event"
      />
    `,
  }),
};
