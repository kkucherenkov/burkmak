import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppBadge from '../AppBadge/AppBadge.vue';
import AppStatusBadge from './AppStatusBadge.vue';

const global = { stubs: { UIcon: true } } as const;
const mountWith = (status: 'pending' | 'ready' | 'failed') =>
  mount(AppStatusBadge, { global, props: { status, label: status } });

describe('AppStatusBadge', () => {
  it('maps ready → success', () => {
    expect(mountWith('ready').findComponent(AppBadge).props('color')).toBe('success');
  });
  it('maps failed → error', () => {
    expect(mountWith('failed').findComponent(AppBadge).props('color')).toBe('error');
  });
  it('maps pending → info', () => {
    expect(mountWith('pending').findComponent(AppBadge).props('color')).toBe('info');
  });
  it('renders the provided label', () => {
    expect(mountWith('ready').text()).toContain('ready');
  });
  it('applies the status modifier class', () => {
    expect(mountWith('pending').classes()).toContain('app-status-badge--pending');
  });
});
