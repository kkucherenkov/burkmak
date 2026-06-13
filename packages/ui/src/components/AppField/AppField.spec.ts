import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, type PropType } from 'vue';

import AppField from './AppField.vue';

type FieldSize = 'sm' | 'md' | 'lg';

// Wraps AppField in a tiny component that spreads the slot attrs onto a plain
// <input>, mirroring how a real consumer wires a UInput or native control.
const Harness = defineComponent({
  props: {
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    help: { type: String, default: undefined },
    error: { type: String, default: undefined },
    size: { type: String as PropType<FieldSize>, default: 'md' },
  },
  setup(props) {
    return () =>
      h(
        AppField,
        {
          label: props.label,
          required: props.required,
          help: props.help,
          error: props.error,
          size: props.size,
        },
        {
          default: (slotProps: Record<string, unknown>) =>
            h('input', { type: 'text', ...slotProps, 'data-testid': 'input' }),
        },
      );
  },
});

describe('AppField', () => {
  it('renders the label text via AppLabel', () => {
    const wrapper = mount(Harness, { props: { label: 'Email' } });
    expect(wrapper.find('.app-label').exists()).toBe(true);
    expect(wrapper.text()).toContain('Email');
  });

  it('shows help text when provided and no error is set', () => {
    const wrapper = mount(Harness, { props: { label: 'E', help: 'Helpful hint' } });
    const help = wrapper.find('.app-field__help');
    expect(help.exists()).toBe(true);
    expect(help.text()).toBe('Helpful hint');
    expect(wrapper.find('.app-field__error').exists()).toBe(false);
  });

  it('replaces help with error when both are set', () => {
    const wrapper = mount(Harness, {
      props: { label: 'E', help: 'Helpful hint', error: 'Bad input' },
    });
    expect(wrapper.find('.app-field__help').exists()).toBe(false);
    const error = wrapper.find('.app-field__error');
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe('Bad input');
  });

  it('marks the error element with role="alert" so SR users hear changes', () => {
    const wrapper = mount(Harness, { props: { label: 'E', error: 'Bad' } });
    expect(wrapper.find('.app-field__error').attributes('role')).toBe('alert');
  });

  it('toggles the --error modifier class when an error is present', () => {
    const wrapper = mount(Harness, { props: { label: 'E', error: 'Bad' } });
    expect(wrapper.find('.app-field--error').exists()).toBe(true);
  });

  it('propagates required down to AppLabel (marker visible)', () => {
    const wrapper = mount(Harness, { props: { label: 'E', required: true } });
    expect(wrapper.find('.app-label__required').exists()).toBe(true);
  });

  it('links the slotted input to the help element via aria-describedby', () => {
    const wrapper = mount(Harness, { props: { label: 'E', help: 'Hint' } });
    const input = wrapper.find('[data-testid="input"]');
    const help = wrapper.find('.app-field__help');
    const descId = help.attributes('id');
    expect(descId).toBeTruthy();
    expect(input.attributes('aria-describedby')).toBe(descId);
  });

  it('links the slotted input to the error element via aria-describedby when errored', () => {
    const wrapper = mount(Harness, { props: { label: 'E', error: 'Bad' } });
    const input = wrapper.find('[data-testid="input"]');
    const error = wrapper.find('.app-field__error');
    const descId = error.attributes('id');
    expect(descId).toBeTruthy();
    expect(input.attributes('aria-describedby')).toBe(descId);
  });

  it('sets aria-invalid="true" on the slotted input when errored', () => {
    const wrapper = mount(Harness, { props: { label: 'E', error: 'Bad' } });
    const input = wrapper.find('[data-testid="input"]');
    expect(input.attributes('aria-invalid')).toBe('true');
  });

  it('does not set aria-invalid on the slotted input when there is no error', () => {
    const wrapper = mount(Harness, { props: { label: 'E' } });
    const input = wrapper.find('[data-testid="input"]');
    expect(input.attributes('aria-invalid')).toBeUndefined();
  });

  it('links the label `for` to the input `id` so clicking the label focuses the input', () => {
    const wrapper = mount(Harness, { props: { label: 'E' } });
    const label = wrapper.find('label');
    const input = wrapper.find('[data-testid="input"]');
    const id = input.attributes('id');
    expect(id).toBeTruthy();
    expect(label.attributes('for')).toBe(id);
  });

  it('forwards aria-required onto the slotted input when required', () => {
    const wrapper = mount(Harness, { props: { label: 'E', required: true } });
    const input = wrapper.find('[data-testid="input"]');
    expect(input.attributes('aria-required')).toBe('true');
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size modifier for size=%s', (size) => {
    const wrapper = mount(Harness, { props: { label: 'E', size } });
    expect(wrapper.find(`.app-field--${size}`).exists()).toBe(true);
  });
});
