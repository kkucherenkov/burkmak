import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppSkeleton from './AppSkeleton.vue';

const VARIANTS = ['text', 'title', 'meta', 'avatar', 'image'] as const;

describe('AppSkeleton', () => {
  it.each(VARIANTS)('applies the %s variant class', (variant) => {
    const w = mount(AppSkeleton, { props: { variant } });
    expect(w.classes()).toContain(`app-skeleton--${variant}`);
  });
  it('defaults to text', () => {
    expect(mount(AppSkeleton).classes()).toContain('app-skeleton--text');
  });
  it('is hidden from assistive tech', () => {
    expect(mount(AppSkeleton).attributes('aria-hidden')).toBe('true');
  });
});
