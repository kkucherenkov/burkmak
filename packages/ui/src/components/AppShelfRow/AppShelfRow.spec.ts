import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import AppShelfRow from './AppShelfRow.vue';

const shelf = { id: 's1', name: 'Reading', itemCount: 3 };
const labels = { rename: 'Rename', delete: 'Delete', itemCount: '3 items' };

describe('AppShelfRow', () => {
  it('renders the name and the item count', () => {
    const w = mount(AppShelfRow, { props: { shelf, labels } });
    expect(w.text()).toContain('Reading');
    expect(w.text()).toContain('3 items');
  });

  it('emits open with the id when the name is clicked', async () => {
    const w = mount(AppShelfRow, { props: { shelf, labels } });
    await w.find('.app-shelf-row__name').trigger('click');
    expect(w.emitted('open')?.[0]).toEqual(['s1']);
  });

  it('emits rename and delete from their actions', async () => {
    const w = mount(AppShelfRow, { props: { shelf, labels } });
    await w.find('[data-testid="ren"]').trigger('click');
    await w.find('[data-testid="del"]').trigger('click');
    expect(w.emitted('rename')?.[0]).toEqual(['s1']);
    expect(w.emitted('delete')?.[0]).toEqual(['s1']);
  });
});
