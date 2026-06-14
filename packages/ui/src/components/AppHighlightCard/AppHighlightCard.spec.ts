import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppHighlightCard from './AppHighlightCard.vue';
import type { AppHighlightCardHighlight } from './AppHighlightCard.vue';

const global = { stubs: { UIcon: true } } as const;

const highlight: AppHighlightCardHighlight = {
  id: 'h1',
  quote: 'a feed asks for everything',
  prefix: 'A printed page asks for nothing; ',
  suffix: ', all at once',
  color: 'yellow',
  note: 'This is the core tension.',
};

const labels = {
  edit: 'Edit note',
  delete: 'Delete',
  save: 'Save note',
  cancel: 'Cancel',
  notePlaceholder: 'Add a note…',
};

describe('AppHighlightCard', () => {
  it('shows the quote and note in view mode', () => {
    const w = mount(AppHighlightCard, { global, props: { highlight, labels } });
    expect(w.find('.app-highlight-card__quote').text()).toContain('a feed asks for everything');
    expect(w.find('.app-highlight-card__note').text()).toContain('This is the core tension.');
  });

  it('emits edit when the edit button is clicked', async () => {
    const w = mount(AppHighlightCard, { global, props: { highlight, labels } });
    await w.find('[data-testid="edit-btn"]').trigger('click');
    expect(w.emitted('edit')).toHaveLength(1);
  });

  it('emits delete when the delete button is clicked', async () => {
    const w = mount(AppHighlightCard, { global, props: { highlight, labels } });
    await w.find('[data-testid="delete-btn"]').trigger('click');
    expect(w.emitted('delete')).toHaveLength(1);
  });

  it('shows the textarea when editing=true', () => {
    const w = mount(AppHighlightCard, {
      global,
      props: { highlight, labels, editing: true },
    });
    expect(w.find('.app-highlight-card__textarea').exists()).toBe(true);
  });

  it('emits save with the textarea value when Save is clicked', async () => {
    const w = mount(AppHighlightCard, {
      global,
      props: { highlight, labels, editing: true },
    });
    const textarea = w.find<HTMLTextAreaElement>('.app-highlight-card__textarea');
    await textarea.setValue('New note text');
    await w.find('[data-testid="save-btn"]').trigger('click');
    expect(w.emitted('save')?.[0]).toEqual(['New note text']);
  });

  it('emits cancel when Cancel is clicked', async () => {
    const w = mount(AppHighlightCard, {
      global,
      props: { highlight, labels, editing: true },
    });
    await w.find('[data-testid="cancel-btn"]').trigger('click');
    expect(w.emitted('cancel')).toHaveLength(1);
  });

  it('applies the color modifier class from highlight.color', () => {
    const w = mount(AppHighlightCard, { global, props: { highlight, labels } });
    expect(w.find('.app-highlight-card--yellow').exists()).toBe(true);
  });
});
