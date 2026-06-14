import type { Meta, StoryObj } from '@storybook/vue3';

import type { AppHighlightCardHighlight } from '../AppArticleReader/highlight-types';

import AppHighlightCard from './AppHighlightCard.vue';

const meta: Meta<typeof AppHighlightCard> = {
  title: 'Compositions/AppHighlightCard',
  component: AppHighlightCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppHighlightCard>;

const labels = {
  edit: 'Edit note',
  delete: 'Delete',
  save: 'Save note',
  cancel: 'Cancel',
  notePlaceholder: 'Add a note…',
};

const baseHighlight: AppHighlightCardHighlight = {
  id: 'h1',
  quote: 'a feed asks for everything, all at once, and rewards the part of us that keeps moving on',
  prefix: 'A printed page asks for nothing; ',
  suffix: ' to the next thing.',
  color: 'yellow',
  note: null,
};

export const View: Story = {
  args: {
    highlight: baseHighlight,
    labels,
  },
};

export const WithNote: Story = {
  args: {
    highlight: {
      ...baseHighlight,
      id: 'h2',
      color: 'green',
      quote: 'The fix is not willpower. It is friction, reintroduced on purpose.',
      note: 'A reading app is a friction machine, pointed the right way.',
    },
    labels,
  },
};

export const Editing: Story = {
  args: {
    highlight: {
      ...baseHighlight,
      id: 'h3',
      color: 'blue',
      quote: 'a warm and patient typeface, no counter ticking down the unread',
      note: 'Design brief for the reader view, basically.',
    },
    editing: true,
    labels,
  },
};
