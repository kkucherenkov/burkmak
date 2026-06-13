import type { ListItemsFilter } from '../../domain/items.ports';

export class ListItemsQuery {
  constructor(public readonly filter: ListItemsFilter) {}
}
