import type { Meta, StoryObj } from '@storybook/vue3';

import AppArticleReader, { type AppHighlightData } from './AppArticleReader.vue';

const meta: Meta<typeof AppArticleReader> = {
  title: 'Compositions/AppArticleReader',
  component: AppArticleReader,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AppArticleReader>;

const sampleHtml = `
<p>There is a particular tiredness that comes from a day of reading without remembering any of it.
You scroll, you skim, you save — and by evening the saved things have become their own quiet source
of guilt, a pile you keep meaning to get to.</p>

<p>What changed is not our capacity for attention but the shape of the surfaces we read on.
A printed page asks for nothing; a feed asks for everything, all at once, and rewards the part
of us that keeps moving on to the next thing. The friction that used to hold us on a page has
been engineered away, and with it the habit of staying.</p>

<p>The fix is not willpower. It is friction, reintroduced on purpose: a single column, a warm
and patient typeface, no counter ticking down the unread, and a way to set a thing aside without
losing it.</p>
`.trim();

const highlights: AppHighlightData[] = [
  {
    id: 'h1',
    quote: 'a feed asks for everything, all at once',
    prefix: 'A printed page asks for nothing; ',
    suffix: ', and rewards the part',
    color: 'yellow',
  },
  {
    id: 'h2',
    quote: 'The fix is not willpower',
    prefix: '\n\n<p>',
    suffix: '. It is friction',
    color: 'green',
  },
];

export const Plain: Story = {
  args: {
    contentHtml: sampleHtml,
    highlights: [],
  },
};

export const WithHighlights: Story = {
  args: {
    contentHtml: sampleHtml,
    highlights,
  },
};
