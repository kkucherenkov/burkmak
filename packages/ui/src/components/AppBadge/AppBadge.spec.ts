import UBadge from '@nuxt/ui/components/Badge.vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppBadge from './AppBadge.vue';

// UIcon resolves iconify collections over the network at runtime — stub it so
// happy-dom doesn't try to fetch. AppBadge renders AppIcon which renders UIcon.
const global = { stubs: { UIcon: true } } as const;

const COLORS = ['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const;
const VARIANTS = ['solid', 'outline', 'soft', 'subtle'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

describe('AppBadge', () => {
  it('renders the label prop', () => {
    const wrapper = mount(AppBadge, { global, props: { label: 'Hello' } });
    expect(wrapper.find('.app-badge__label').text()).toBe('Hello');
  });

  it('prefers slot content over the label prop', () => {
    const wrapper = mount(AppBadge, {
      global,
      props: { label: 'Ignored' },
      slots: { default: 'Slotted' },
    });
    expect(wrapper.find('.app-badge__label').text()).toBe('Slotted');
  });

  it.each(COLORS)('forwards color=%s to UBadge', (color) => {
    const wrapper = mount(AppBadge, { global, props: { color, label: 'x' } });
    expect(wrapper.findComponent(UBadge).props('color')).toBe(color);
  });

  it.each(VARIANTS)('forwards variant=%s to UBadge', (variant) => {
    const wrapper = mount(AppBadge, { global, props: { variant, label: 'x' } });
    expect(wrapper.findComponent(UBadge).props('variant')).toBe(variant);
  });

  it.each(SIZES)('forwards size=%s to UBadge', (size) => {
    const wrapper = mount(AppBadge, { global, props: { size, label: 'x' } });
    expect(wrapper.findComponent(UBadge).props('size')).toBe(size);
  });

  it('defaults to color=neutral, variant=subtle, size=md', () => {
    const wrapper = mount(AppBadge, { global, props: { label: 'x' } });
    const badge = wrapper.findComponent(UBadge);
    expect(badge.props('color')).toBe('neutral');
    expect(badge.props('variant')).toBe('subtle');
    expect(badge.props('size')).toBe('md');
  });

  it('renders an AppIcon on the leading side when `icon` is provided', () => {
    const wrapper = mount(AppBadge, {
      global,
      props: { label: 'Verified', icon: 'i-lucide-check' },
    });
    expect(wrapper.find('.app-badge__icon').exists()).toBe(true);
  });

  it('does not render the icon slot when no `icon` prop is passed', () => {
    const wrapper = mount(AppBadge, { global, props: { label: 'Plain' } });
    expect(wrapper.find('.app-badge__icon').exists()).toBe(false);
  });

  it('applies the `--uppercase` modifier class when uppercase=true', () => {
    const wrapper = mount(AppBadge, {
      global,
      props: { label: 'beta', uppercase: true },
    });
    expect(wrapper.find('.app-badge--uppercase').exists()).toBe(true);
  });

  it('omits the `--uppercase` modifier class by default', () => {
    const wrapper = mount(AppBadge, { global, props: { label: 'beta' } });
    expect(wrapper.find('.app-badge--uppercase').exists()).toBe(false);
  });
});
