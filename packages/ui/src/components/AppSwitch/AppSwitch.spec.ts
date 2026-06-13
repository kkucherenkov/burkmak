import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppSwitch from './AppSwitch.vue';

const SIZES = ['sm', 'md', 'lg'] as const;
const COLORS = ['primary', 'success', 'neutral'] as const;

describe('AppSwitch', () => {
  it('renders with role="switch" and aria-checked reflecting modelValue=false', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false } });
    const control = wrapper.find('[role="switch"]');
    expect(control.exists()).toBe(true);
    expect(control.attributes('aria-checked')).toBe('false');
  });

  it('renders aria-checked=true when modelValue=true', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: true } });
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('true');
  });

  it('applies the --checked modifier when modelValue=true', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: true } });
    expect(wrapper.find('.app-switch--checked').exists()).toBe(true);
  });

  it('emits update:modelValue with the inverted value on click', async () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false } });
    await wrapper.find('[role="switch"]').trigger('click');
    const events = wrapper.emitted('update:modelValue');
    expect(events).toHaveLength(1);
    expect(events?.[0]?.[0]).toBe(true);
  });

  it('emits the inverted value on Space keydown', async () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: true } });
    await wrapper.find('[role="switch"]').trigger('keydown', { key: ' ' });
    const events = wrapper.emitted('update:modelValue');
    expect(events).toHaveLength(1);
    expect(events?.[0]?.[0]).toBe(false);
  });

  it('blocks click when disabled', async () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false, disabled: true } });
    const control = wrapper.find('[role="switch"]');
    expect(control.attributes('disabled')).toBeDefined();
    await control.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('blocks Space keydown when disabled', async () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false, disabled: true } });
    await wrapper.find('[role="switch"]').trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('applies the --disabled modifier when disabled', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false, disabled: true } });
    expect(wrapper.find('.app-switch--disabled').exists()).toBe(true);
  });

  it.each(SIZES)('applies size modifier for size=%s', (size) => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false, size } });
    expect(wrapper.find(`.app-switch--${size}`).exists()).toBe(true);
  });

  it('defaults to size=md', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false } });
    expect(wrapper.find('.app-switch--md').exists()).toBe(true);
  });

  it.each(COLORS)('applies color modifier for color=%s', (color) => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false, color } });
    expect(wrapper.find(`.app-switch--color-${color}`).exists()).toBe(true);
  });

  it('defaults to color=primary', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false } });
    expect(wrapper.find('.app-switch--color-primary').exists()).toBe(true);
  });

  it('renders a <label> wrapper when `label` is provided and exposes it via aria-label', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false, label: 'Notify me' } });
    expect(wrapper.find('label.app-switch').exists()).toBe(true);
    expect(wrapper.find('.app-switch__label').text()).toBe('Notify me');
    expect(wrapper.find('[role="switch"]').attributes('aria-label')).toBe('Notify me');
  });

  it('does not render a wrapper <label> when no label is provided', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false } });
    expect(wrapper.find('label.app-switch').exists()).toBe(false);
    expect(wrapper.find('button.app-switch').exists()).toBe(true);
  });

  it('renders the thumb + track structural nodes', () => {
    const wrapper = mount(AppSwitch, { props: { modelValue: false } });
    expect(wrapper.find('.app-switch__track').exists()).toBe(true);
    expect(wrapper.find('.app-switch__thumb').exists()).toBe(true);
  });
});
