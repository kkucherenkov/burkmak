import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppThemeToggle from './AppThemeToggle.vue';

const global = { stubs: { UIcon: true } } as const;

describe('AppThemeToggle', () => {
  it('shows the moon icon in light mode (destination: dark)', () => {
    const w = mount(AppThemeToggle, { global, props: { mode: 'light', label: 'Toggle theme' } });
    expect(w.find('u-icon-stub').attributes('name')).toBe('i-lucide-moon');
  });
  it('shows the sun icon in dark mode (destination: light)', () => {
    const w = mount(AppThemeToggle, { global, props: { mode: 'dark', label: 'Toggle theme' } });
    expect(w.find('u-icon-stub').attributes('name')).toBe('i-lucide-sun');
  });
  it('exposes the label to assistive tech', () => {
    const w = mount(AppThemeToggle, { global, props: { mode: 'light', label: 'Toggle theme' } });
    expect(w.find('button').attributes('aria-label')).toBe('Toggle theme');
  });
  it('emits toggle on click', async () => {
    const w = mount(AppThemeToggle, { global, props: { mode: 'light', label: 'Toggle theme' } });
    await w.find('button').trigger('click');
    expect(w.emitted('toggle')).toHaveLength(1);
  });
});
