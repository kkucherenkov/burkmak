import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppLabel from './AppLabel.vue';

describe('AppLabel', () => {
  it('renders the provided text', () => {
    const wrapper = mount(AppLabel, { props: { text: 'Email' } });
    expect(wrapper.text()).toContain('Email');
  });

  it('omits the required marker by default', () => {
    const wrapper = mount(AppLabel, { props: { text: 'Email' } });
    expect(wrapper.find('.app-label__required').exists()).toBe(false);
  });

  it('renders the required marker when required=true', () => {
    const wrapper = mount(AppLabel, { props: { text: 'Email', required: true } });
    const marker = wrapper.find('.app-label__required');
    expect(marker.exists()).toBe(true);
    expect(marker.text()).toBe('*');
    // Marker itself is decorative — screen readers announce "required" via aria-required
    // on the linked input, not by reading the star glyph.
    expect(marker.attributes('aria-hidden')).toBe('true');
  });

  it('wires the `for` attribute onto the underlying <label>', () => {
    const wrapper = mount(AppLabel, { props: { text: 'Email', for: 'user-email' } });
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.attributes('for')).toBe('user-email');
  });

  it.each(['sm', 'md'] as const)('applies size modifier for size=%s', (size) => {
    const wrapper = mount(AppLabel, { props: { text: 'Email', size } });
    expect(wrapper.find(`.app-label--${size}`).exists()).toBe(true);
  });

  it('defaults to size=md', () => {
    const wrapper = mount(AppLabel, { props: { text: 'Email' } });
    expect(wrapper.find('.app-label--md').exists()).toBe(true);
  });
});
