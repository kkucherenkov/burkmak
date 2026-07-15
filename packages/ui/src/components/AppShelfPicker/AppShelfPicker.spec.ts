import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import AppShelfPicker from './AppShelfPicker.vue';

const shelves = [
  { id: 's1', name: 'Reading' },
  { id: 's2', name: 'Later' },
];
const labels = { add: 'Add', remove: 'Remove', empty: 'No shelves yet' };

describe('AppShelfPicker', () => {
  it('marks the selected shelves', () => {
    const w = mount(AppShelfPicker, { props: { shelves, selectedIds: ['s1'], labels } });
    const boxes = w.findAll('input[type="checkbox"]');
    expect((boxes[0]!.element as HTMLInputElement).checked).toBe(true);
    expect((boxes[1]!.element as HTMLInputElement).checked).toBe(false);
  });

  it('emits toggle true when an unselected shelf is picked', async () => {
    const w = mount(AppShelfPicker, { props: { shelves, selectedIds: ['s1'], labels } });
    await w.findAll('input[type="checkbox"]')[1]!.setValue(true);
    expect(w.emitted('toggle')?.[0]).toEqual(['s2', true]);
  });

  it('emits toggle false when a selected shelf is unpicked', async () => {
    const w = mount(AppShelfPicker, { props: { shelves, selectedIds: ['s1'], labels } });
    await w.findAll('input[type="checkbox"]')[0]!.setValue(false);
    expect(w.emitted('toggle')?.[0]).toEqual(['s1', false]);
  });

  it('shows the empty label when there are no shelves', () => {
    const w = mount(AppShelfPicker, { props: { shelves: [], selectedIds: [], labels } });
    expect(w.text()).toContain('No shelves yet');
  });

  it('hides the add/remove hint word from assistive tech (the checkbox already conveys state)', () => {
    const w = mount(AppShelfPicker, { props: { shelves, selectedIds: ['s1'], labels } });
    const hint = w.find('.app-shelf-picker__state');
    expect(hint.attributes('aria-hidden')).toBe('true');
  });
});
