import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppButton from './AppButton.vue';

// Stub UIcon — AppIcon (composed by AppButton) renders it, and the real UIcon
// resolves iconify collections over HTTP / bundled assets which happy-dom can't
// handle. We intentionally DO NOT stub AppIcon itself so its wrapper contract
// is exercised.
const global = { stubs: { UIcon: true } } as const;

describe('AppButton', () => {
  it('renders the label', () => {
    const wrapper = mount(AppButton, { global, props: { label: 'Save' } });
    expect(wrapper.text()).toContain('Save');
  });

  it('renders slot content over the label prop when both are provided', () => {
    const wrapper = mount(AppButton, {
      global,
      props: { label: 'Ignored' },
      slots: { default: 'From slot' },
    });
    expect(wrapper.text()).toContain('From slot');
    expect(wrapper.text()).not.toContain('Ignored');
  });

  it.each([
    ['solid', 'primary'],
    ['outline', 'neutral'],
    ['ghost', 'success'],
    ['link', 'warning'],
  ] as const)('accepts variant=%s color=%s', (variant, color) => {
    const wrapper = mount(AppButton, { global, props: { variant, color, label: 'X' } });
    expect(wrapper.find('.app-button').exists()).toBe(true);
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size modifier for size=%s', (size) => {
    const wrapper = mount(AppButton, { global, props: { size, label: 'X' } });
    expect(wrapper.find(`.app-button--${size}`).exists()).toBe(true);
  });

  it('defaults to size=md', () => {
    const wrapper = mount(AppButton, { global, props: { label: 'X' } });
    expect(wrapper.find('.app-button--md').exists()).toBe(true);
  });

  it('emits click with the original MouseEvent', async () => {
    const wrapper = mount(AppButton, { global, props: { label: 'Click' } });
    await wrapper.find('button').trigger('click');
    const events = wrapper.emitted('click');
    expect(events).toHaveLength(1);
    expect(events?.[0]?.[0]).toBeInstanceOf(MouseEvent);
  });

  it('blocks clicks when disabled', async () => {
    const wrapper = mount(AppButton, { global, props: { label: 'Off', disabled: true } });
    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    await button.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('renders an accessible button element for keyboard users', () => {
    const wrapper = mount(AppButton, { global, props: { label: 'Go' } });
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.element.tagName).toBe('BUTTON');
  });

  it('disables the button and marks it aria-busy while loading', () => {
    const wrapper = mount(AppButton, { global, props: { label: 'Saving', loading: true } });
    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.attributes('aria-busy')).toBe('true');
  });

  it('does not render the leading AppIcon while loading (spinner replaces it)', () => {
    const wrapper = mount(AppButton, {
      global,
      props: { label: 'Saving', icon: 'i-lucide-check', loading: true },
    });
    expect(wrapper.find('.app-button__icon--leading').exists()).toBe(false);
  });

  it('renders a leading AppIcon when `icon` is provided', () => {
    const wrapper = mount(AppButton, {
      global,
      props: { label: 'Confirm', icon: 'i-lucide-check' },
    });
    const leading = wrapper.find('.app-button__icon--leading');
    expect(leading.exists()).toBe(true);
    expect(leading.classes()).toContain('app-icon');
  });

  it('renders a trailing AppIcon when `iconTrailing` is provided', () => {
    const wrapper = mount(AppButton, {
      global,
      props: { label: 'Next', iconTrailing: 'i-lucide-arrow-right' },
    });
    const trailing = wrapper.find('.app-button__icon--trailing');
    expect(trailing.exists()).toBe(true);
    expect(trailing.classes()).toContain('app-icon');
  });

  it('positions icons on either side of the label when both are provided', () => {
    const wrapper = mount(AppButton, {
      global,
      props: {
        label: 'Go',
        icon: 'i-lucide-arrow-left',
        iconTrailing: 'i-lucide-arrow-right',
      },
    });
    expect(wrapper.find('.app-button__icon--leading').exists()).toBe(true);
    expect(wrapper.find('.app-button__icon--trailing').exists()).toBe(true);
    expect(wrapper.find('.app-button__label').text()).toBe('Go');
  });
});
