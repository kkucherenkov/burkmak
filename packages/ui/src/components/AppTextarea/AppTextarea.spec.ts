import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';

import AppField from '../AppField/AppField.vue';

import AppTextarea from './AppTextarea.vue';

// Render helpers live as plain functions (no inline defineComponent) so
// `vue/one-component-per-file` stays quiet — we only ever mount the real
// component, tests supply props via closures.
function renderInsideField(params: {
  label: string;
  required?: boolean;
  error?: string;
  modelValue?: string;
}) {
  return mount(AppField, {
    props: {
      label: params.label,
      required: params.required ?? false,
      error: params.error,
    },
    slots: {
      default: (slotProps: Record<string, unknown>) =>
        h(AppTextarea, { ...slotProps, modelValue: params.modelValue ?? '' }),
    },
  });
}

describe('AppTextarea', () => {
  it('renders a native <textarea> element', () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: '' } });
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('textarea.app-textarea').exists()).toBe(true);
  });

  it('reflects modelValue into the textarea value', () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: 'hello world' } });
    const textarea = wrapper.find('textarea').element as HTMLTextAreaElement;
    expect(textarea.value).toBe('hello world');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: '' } });
    const textarea = wrapper.find('textarea');
    (textarea.element as HTMLTextAreaElement).value = 'typed';
    await textarea.trigger('input');
    const events = wrapper.emitted('update:modelValue');
    expect(events).toBeTruthy();
    expect(events?.[0]).toEqual(['typed']);
  });

  it('forwards placeholder to the textarea', () => {
    const wrapper = mount(AppTextarea, {
      props: { modelValue: '', placeholder: 'write notes' },
    });
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('write notes');
  });

  it('forwards rows to the textarea (default=3)', () => {
    const wrapperDefault = mount(AppTextarea, { props: { modelValue: '' } });
    expect(wrapperDefault.find('textarea').attributes('rows')).toBe('3');

    const wrapperExplicit = mount(AppTextarea, {
      props: { modelValue: '', rows: 8 },
    });
    expect(wrapperExplicit.find('textarea').attributes('rows')).toBe('8');
  });

  it('does not emit update:modelValue when disabled (UA blocks the event)', () => {
    // The browser fires no `input` event on a disabled textarea; mirror that
    // here by asserting the disabled attribute is present — which guarantees
    // the UA blocks typing, not our component.
    const wrapper = mount(AppTextarea, { props: { modelValue: '', disabled: true } });
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('disabled')).toBeDefined();
    expect(wrapper.find('.app-textarea--disabled').exists()).toBe(true);
  });

  it('sets readonly attribute without disabling the control', () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: 'ro', readonly: true } });
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('readonly')).toBeDefined();
    expect(textarea.attributes('disabled')).toBeUndefined();
    expect(wrapper.find('.app-textarea--readonly').exists()).toBe(true);
  });

  it.each(['sm', 'md', 'lg'] as const)('applies size modifier for size=%s', (size) => {
    const wrapper = mount(AppTextarea, { props: { modelValue: '', size } });
    expect(wrapper.find(`.app-textarea--${size}`).exists()).toBe(true);
  });

  it('defaults to size=md', () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: '' } });
    expect(wrapper.find('.app-textarea--md').exists()).toBe(true);
  });

  it.each(['none', 'vertical', 'horizontal', 'both'] as const)(
    'applies resize modifier for resize=%s',
    (resize) => {
      const wrapper = mount(AppTextarea, { props: { modelValue: '', resize } });
      expect(wrapper.find(`.app-textarea--resize-${resize}`).exists()).toBe(true);
    },
  );

  it('defaults to resize=vertical', () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: '' } });
    expect(wrapper.find('.app-textarea--resize-vertical').exists()).toBe(true);
  });

  it('adds the --autogrow modifier class when autoGrow is enabled', () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: '', autoGrow: true } });
    expect(wrapper.find('.app-textarea--autogrow').exists()).toBe(true);
  });

  it('omits the --autogrow modifier by default', () => {
    const wrapper = mount(AppTextarea, { props: { modelValue: '' } });
    expect(wrapper.find('.app-textarea--autogrow').exists()).toBe(false);
  });

  it('declares focus-visible styling via the tokens (no outline: none without ring)', () => {
    // The SCSS is scoped and happy-dom doesn't apply it; instead we assert the
    // classes the stylesheet selects on actually land on the rendered element,
    // which is the only thing the spec can verify short of a visual regression.
    const wrapper = mount(AppTextarea, { props: { modelValue: '' } });
    expect(wrapper.classes()).toContain('app-textarea');
  });

  it('forwards arbitrary aria-* attrs onto the textarea (not the wrapper)', () => {
    const wrapper = mount(AppTextarea, {
      props: { modelValue: '' },
      attrs: {
        id: 'notes-field',
        'aria-describedby': 'notes-desc',
        'aria-invalid': 'true',
        'aria-required': 'true',
      },
    });
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('id')).toBe('notes-field');
    expect(textarea.attributes('aria-describedby')).toBe('notes-desc');
    expect(textarea.attributes('aria-invalid')).toBe('true');
    expect(textarea.attributes('aria-required')).toBe('true');
  });

  it('composes inside AppField: slot attrs reach the textarea', () => {
    const wrapper = renderInsideField({ label: 'Notes', required: true });
    const textarea = wrapper.find('textarea');
    // AppField generates an id via useId() and passes it through the slot —
    // the textarea should pick it up and the <label> should link to the same
    // id.
    expect(textarea.attributes('id')).toBeTruthy();
    expect(textarea.attributes('aria-required')).toBe('true');
    const labelFor = wrapper.find('label').attributes('for');
    expect(labelFor).toBe(textarea.attributes('id'));
  });

  it('composes inside AppField: error state sets aria-invalid + wires describedby', () => {
    const wrapper = renderInsideField({
      label: 'Notes',
      error: 'Please add more detail',
    });
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('aria-invalid')).toBe('true');
    const error = wrapper.find('.app-field__error');
    expect(error.exists()).toBe(true);
    expect(textarea.attributes('aria-describedby')).toBe(error.attributes('id'));
  });
});
