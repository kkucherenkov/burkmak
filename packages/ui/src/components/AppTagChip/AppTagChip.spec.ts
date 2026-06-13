import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppChip from '../AppChip/AppChip.vue';
import AppTagChip from './AppTagChip.vue';

const global = { stubs: { UIcon: true } } as const;

describe('AppTagChip', () => {
  it('forwards the label', () => {
    const w = mount(AppTagChip, { global, props: { label: 'rust' } });
    expect(w.text()).toContain('rust');
  });
  it('maps selected → AppChip selected', () => {
    const w = mount(AppTagChip, { global, props: { label: 'x', selected: true } });
    expect(w.findComponent(AppChip).props('selected')).toBe(true);
  });
  it('maps removable → AppChip dismissible', () => {
    const w = mount(AppTagChip, { global, props: { label: 'x', removable: true } });
    expect(w.findComponent(AppChip).props('dismissible')).toBe(true);
  });
  it('re-emits click', async () => {
    const w = mount(AppTagChip, { global, props: { label: 'x' } });
    await w.findComponent(AppChip).vm.$emit('click', new MouseEvent('click'));
    expect(w.emitted('click')).toHaveLength(1);
  });
  it('re-emits dismiss as remove', async () => {
    const w = mount(AppTagChip, { global, props: { label: 'x', removable: true } });
    await w.findComponent(AppChip).vm.$emit('dismiss', new Event('dismiss'));
    expect(w.emitted('remove')).toHaveLength(1);
  });
});
