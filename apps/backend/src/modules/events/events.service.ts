import { Injectable } from '@nestjs/common';
import { Subject, type Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface UserEvent {
  userId: string;
  type: string;
  data: unknown;
}

/** Shape NestJS @Sse serializes to `data: <json>` lines. */
export interface SseMessage {
  data: { type: string; data: unknown };
}

@Injectable()
export class EventsService {
  private readonly bus = new Subject<UserEvent>();

  publish(userId: string, type: string, data: unknown): void {
    this.bus.next({ userId, type, data });
  }

  stream(userId: string): Observable<SseMessage> {
    return this.bus.asObservable().pipe(
      filter((e) => e.userId === userId),
      map((e) => ({ data: { type: e.type, data: e.data } })),
    );
  }
}
