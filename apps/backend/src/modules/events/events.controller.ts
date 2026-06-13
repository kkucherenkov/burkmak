import { Controller, Req, Sse, UseGuards } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { merge, interval } from 'rxjs';
import { map } from 'rxjs/operators';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { EventsService, type SseMessage } from './events.service';

@Controller({ path: 'events', version: '1' })
@UseGuards(SessionGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse()
  stream(@Req() req: AuthenticatedRequest): Observable<SseMessage> {
    // 25s heartbeat keeps proxies from closing idle connections.
    const heartbeat = interval(25_000).pipe(
      map((): SseMessage => ({ data: { type: 'ping', data: null } })),
    );
    return merge(this.events.stream(req.userId), heartbeat);
  }
}
