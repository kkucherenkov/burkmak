import { describe, it, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { EventsService } from './events.service';

describe('EventsService', () => {
  it('delivers an event only to the matching user', async () => {
    const svc = new EventsService();
    const got = firstValueFrom(svc.stream('u1').pipe(take(1), toArray()));
    svc.publish('u2', 'item.updated', { id: 'x' }); // ignored
    svc.publish('u1', 'item.updated', { id: 'a' }); // delivered
    const events = await got;
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ data: { type: 'item.updated', data: { id: 'a' } } });
  });
});
