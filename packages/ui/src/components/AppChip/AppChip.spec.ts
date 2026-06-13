import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppChip from './AppChip.vue';

// UIcon resolves iconify collections over the network at runtime — stub it so
// happy-dom doesn't try to fetch. AppChip renders AppIcon which renders UIcon.
const global = { stubs: { UIcon: true } } as const;

const COLORS = ['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const;
const VARIANTS = ['solid', 'soft', 'subtle', 'outline'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

describe('AppChip', () => {
  it('renders the label prop', () => {
    const wrapper = mount(AppChip, { global, props: { label: 'Hello' } });
    expect(wrapper.find('.app-chip__label').text()).toBe('Hello');
  });

  it('prefers slot content over the label prop', () => {
    const wrapper = mount(AppChip, {
      global,
      props: { label: 'Ignored' },
      slots: { default: 'Slotted' },
    });
    expect(wrapper.find('.app-chip__label').text()).toBe('Slotted');
  });

  it.each(COLORS)('applies the color=%s modifier class', (color) => {
    const wrapper = mount(AppChip, { global, props: { color, label: 'x' } });
    expect(wrapper.find(`.app-chip--${color}`).exists()).toBe(true);
  });

  it.each(VARIANTS)('applies the variant=%s modifier class', (variant) => {
    const wrapper = mount(AppChip, { global, props: { variant, label: 'x' } });
    expect(wrapper.find(`.app-chip--${variant}`).exists()).toBe(true);
  });

  it.each(SIZES)('applies the size=%s modifier class', (size) => {
    const wrapper = mount(AppChip, { global, props: { size, label: 'x' } });
    expect(wrapper.find(`.app-chip--${size}`).exists()).toBe(true);
  });

  it('defaults to color=neutral, variant=soft, size=md', () => {
    const wrapper = mount(AppChip, { global, props: { label: 'x' } });
    expect(wrapper.find('.app-chip--neutral').exists()).toBe(true);
    expect(wrapper.find('.app-chip--soft').exists()).toBe(true);
    expect(wrapper.find('.app-chip--md').exists()).toBe(true);
  });

  it('renders the leading AppIcon when `icon` is provided', () => {
    const wrapper = mount(AppChip, {
      global,
      props: { label: 'Verified', icon: 'i-lucide-check' },
    });
    expect(wrapper.find('.app-chip__icon').exists()).toBe(true);
  });

  it('does not render the leading icon slot when no `icon` is passed', () => {
    const wrapper = mount(AppChip, { global, props: { label: 'Plain' } });
    expect(wrapper.find('.app-chip__icon').exists()).toBe(false);
  });

  it('does not render the dismiss button by default', () => {
    const wrapper = mount(AppChip, { global, props: { label: 'x' } });
    expect(wrapper.find('.app-chip__dismiss').exists()).toBe(false);
  });

  it('renders the dismiss button when `dismissible` is true', () => {
    const wrapper = mount(AppChip, {
      global,
      props: { label: 'x', dismissible: true },
    });
    expect(wrapper.find('.app-chip__dismiss').exists()).toBe(true);
  });

  it('emits `dismiss` when the close button is clicked and does not bubble into `click`', async () => {
    const wrapper = mount(AppChip, {
      global,
      props: { label: 'x', dismissible: true },
    });
    await wrapper.find('.app-chip__dismiss').trigger('click');

    expect(wrapper.emitted('dismiss')).toHaveLength(1);
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('emits `click` when the chip body is clicked', async () => {
    const wrapper = mount(AppChip, { global, props: { label: 'x' } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('applies the `--selected` modifier and aria-pressed="true" when selected', () => {
    const wrapper = mount(AppChip, {
      global,
      props: { label: 'x', selected: true },
    });
    expect(wrapper.find('.app-chip--selected').exists()).toBe(true);
    expect(wrapper.attributes('aria-pressed')).toBe('true');
  });

  it('omits the `--selected` modifier and aria-pressed by default', () => {
    const wrapper = mount(AppChip, { global, props: { label: 'x' } });
    expect(wrapper.find('.app-chip--selected').exists()).toBe(false);
    expect(wrapper.attributes('aria-pressed')).toBeUndefined();
  });

  it('blocks `click` when disabled', async () => {
    const wrapper = mount(AppChip, {
      global,
      props: { label: 'x', disabled: true },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
    expect(wrapper.find('.app-chip--disabled').exists()).toBe(true);
    expect(wrapper.attributes('aria-disabled')).toBe('true');
  });

  it('blocks `dismiss` when disabled', async () => {
    const wrapper = mount(AppChip, {
      global,
      props: { label: 'x', dismissible: true, disabled: true },
    });
    await wrapper.find('.app-chip__dismiss').trigger('click');
    expect(wrapper.emitted('dismiss')).toBeUndefined();
  });
});
