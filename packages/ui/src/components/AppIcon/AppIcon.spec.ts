import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppIcon from './AppIcon.vue';

// Stub UIcon to a plain span — the real UIcon resolves iconify collections
// over HTTP / bundled assets, which happy-dom can't handle. We only need to
// assert the wrapper's a11y/size contract.
const global = { stubs: { UIcon: true } } as const;

describe('AppIcon', () => {
  it('renders with the name prop applied', () => {
    const wrapper = mount(AppIcon, { global, props: { name: 'i-lucide-check' } });
    expect(wrapper.find('.app-icon').exists()).toBe(true);
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('applies size modifier for size=%s', (size) => {
    const wrapper = mount(AppIcon, { global, props: { name: 'i-lucide-check', size } });
    expect(wrapper.find(`.app-icon--${size}`).exists()).toBe(true);
  });

  it('defaults to size=md', () => {
    const wrapper = mount(AppIcon, { global, props: { name: 'i-lucide-check' } });
    expect(wrapper.find('.app-icon--md').exists()).toBe(true);
  });

  it('is marked decorative when no label is provided', () => {
    const wrapper = mount(AppIcon, { global, props: { name: 'i-lucide-check' } });
    const el = wrapper.find('.app-icon');
    expect(el.attributes('aria-hidden')).toBe('true');
    expect(el.attributes('aria-label')).toBeUndefined();
  });

  it('exposes an accessible label when provided', () => {
    const wrapper = mount(AppIcon, {
      global,
      props: { name: 'i-lucide-shield-check', label: 'Verified' },
    });
    const el = wrapper.find('.app-icon');
    expect(el.attributes('aria-label')).toBe('Verified');
    expect(el.attributes('aria-hidden')).toBeUndefined();
  });

  it('treats an empty-string label as decorative, not labelled', () => {
    const wrapper = mount(AppIcon, { global, props: { name: 'i-lucide-check', label: '' } });
    const el = wrapper.find('.app-icon');
    expect(el.attributes('aria-hidden')).toBe('true');
    expect(el.attributes('aria-label')).toBeUndefined();
  });
});
