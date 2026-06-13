/**
 * useApi — typed HTTP wrapper over the backend REST API.
 *
 * All HTTP calls from the app go through this composable. The interface below
 * should grow as routes are added to `packages/specs/openapi/openapi.yaml` and
 * the client is regenerated via `pnpm spec:codegen`.
 *
 * Convention:
 *   - Paths mirror the OpenAPI paths without the `/api/v1` prefix.
 *   - Types are imported from `@app/specs` (generated) — never declared inline.
 */

export interface ApiClient {
  // system
  getHealth(): Promise<{ status: string }>;
}

interface RequestInitLite {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function useApi(): ApiClient {
  const { public: pub } = useRuntimeConfig();
  const baseURL = pub.apiBaseUrl;

  async function request<T>(path: string, init?: RequestInitLite): Promise<T> {
    return await $fetch<T>(path, {
      baseURL,
      credentials: 'include',
      method: init?.method ?? 'GET',
      ...(init?.body === undefined ? {} : { body: init.body }),
      ...(init?.query === undefined ? {} : { params: init.query }),
      ...(init?.headers === undefined ? {} : { headers: init.headers }),
    });
  }

  return {
    getHealth: () => request<{ status: string }>('/health'),
  };
}
