import { onBeforeUnmount, onMounted } from 'vue';

import { routeEvent } from '~/utils/items-store';

/**
 * Opens a native EventSource to GET /api/v1/events.
 *
 * Cross-origin caveat: `withCredentials: true` is required so the browser
 * sends the session cookie. The backend CORS policy must allow the web
 * origin with `credentials: true`; a wildcard origin (`*`) is incompatible
 * with credentialed requests and will cause the connection to be blocked.
 *
 * The backend emits standard SSE `message` events whose `data` field is a
 * JSON string matching the envelope `{ type: string; data: { id?: string } }`.
 * Named event types (e.g. `event: item.created`) are not used; all events
 * arrive as the default `message` event so a single `onmessage` handler
 * covers every case.
 */
export function useEvents(): { connect: () => void; disconnect: () => void } {
  const store = useItems();
  const { public: pub } = useRuntimeConfig();
  let es: EventSource | null = null;

  function connect(): void {
    if (es) return;
    es = new EventSource(`${pub.apiBaseUrl}/events`, { withCredentials: true });
    es.addEventListener('message', (e: MessageEvent<string>) => {
      let evt: { type: string; data: { id?: string } };
      try {
        evt = JSON.parse(e.data) as { type: string; data: { id?: string } };
      } catch {
        return;
      }
      const action = routeEvent(evt);
      if (action.kind === 'refetch') void store.refetchOne(action.id);
      else if (action.kind === 'remove') store.removeLocal(action.id);
    });
  }

  function disconnect(): void {
    es?.close();
    es = null;
  }

  onMounted(connect);
  onBeforeUnmount(disconnect);
  return { connect, disconnect };
}
