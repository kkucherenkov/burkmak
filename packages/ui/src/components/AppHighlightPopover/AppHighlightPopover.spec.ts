import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppHighlightPopover from './AppHighlightPopover.vue';

const global = { stubs: { UIcon: true } } as const;

const labels = { addNote: 'Add note' };

describe('AppHighlightPopover', () => {
  it('renders 4 color swatches by default', () => {
    const w = mount(AppHighlightPopover, { global, props: { labels } });
    expect(w.findAll('.app-highlight-popover__swatch')).toHaveLength(4);
  });

  it('clicking a swatch emits pick with its color', async () => {
    const w = mount(AppHighlightPopover, { global, props: { labels } });
    await w.find('.app-highlight-popover__swatch--yellow').trigger('click');
    expect(w.emitted('pick')?.[0]).toEqual(['yellow']);
  });

  it('clicking the add-note button emits addNote', async () => {
    const w = mount(AppHighlightPopover, { global, props: { labels } });
    await w.find('[data-testid="add-note-btn"]').trigger('click');
    expect(w.emitted('addNote')).toHaveLength(1);
  });

  it('renders with a custom colors prop', () => {
    const w = mount(AppHighlightPopover, {
      global,
      props: { labels, colors: ['yellow', 'green'] as const },
    });
    expect(w.findAll('.app-highlight-popover__swatch')).toHaveLength(2);
  });
});
