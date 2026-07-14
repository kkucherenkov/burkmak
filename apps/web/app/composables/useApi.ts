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

import type { components } from '@app/specs';

type Item = components['schemas']['Item'];
type ItemList = components['schemas']['ItemList'];
type TagList = components['schemas']['TagList'];
type SaveItemRequest = components['schemas']['SaveItemRequest'];
type UpdateItemRequest = components['schemas']['UpdateItemRequest'];
type ReadState = components['schemas']['ReadState'];
type Kind = components['schemas']['Kind'];
type ExtractAccepted = components['schemas']['ExtractAccepted'];
type Article = components['schemas']['Article'];
type Highlight = components['schemas']['Highlight'];
type HighlightList = components['schemas']['HighlightList'];
type CreateHighlightRequest = components['schemas']['CreateHighlightRequest'];
type UpdateHighlightRequest = components['schemas']['UpdateHighlightRequest'];
type PersonalAccessToken = components['schemas']['PersonalAccessToken'];
type PersonalAccessTokenCreated = components['schemas']['PersonalAccessTokenCreated'];
type TokenList = components['schemas']['TokenList'];
type CreateTokenRequest = components['schemas']['CreateTokenRequest'];

export interface ItemsQuery {
  readState?: ReadState;
  tag?: string;
  favorite?: boolean;
  q?: string;
  kind?: Kind;
  cursor?: string;
  limit?: number;
}

export interface ApiClient {
  // system
  getHealth(): Promise<{ status: string }>;

  // items
  getItems(query?: ItemsQuery): Promise<ItemList>;
  getItem(id: string): Promise<Item>;
  saveItem(body: SaveItemRequest): Promise<Item>;
  updateItem(id: string, body: UpdateItemRequest): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  addItemTag(id: string, tag: string): Promise<Item>;
  removeItemTag(id: string, tagSlug: string): Promise<void>;

  // tags
  getTags(): Promise<TagList>;
  renameTag(id: string, name: string): Promise<void>;
  deleteTag(id: string): Promise<void>;

  // extraction
  extractArticle(id: string): Promise<ExtractAccepted>;
  getArticle(id: string): Promise<Article>;

  // highlights
  listHighlights(id: string): Promise<HighlightList>;
  createHighlight(id: string, body: CreateHighlightRequest): Promise<Highlight>;
  updateHighlight(hid: string, body: UpdateHighlightRequest): Promise<Highlight>;
  deleteHighlight(hid: string): Promise<void>;

  // personal access tokens
  createToken(body: CreateTokenRequest): Promise<PersonalAccessTokenCreated>;
  listTokens(): Promise<TokenList>;
  revokeToken(id: string): Promise<void>;
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

    getItems: (query) => request<ItemList>('/items', { query: query as Record<string, unknown> }),
    getItem: (id) => request<Item>(`/items/${id}`),
    saveItem: (body) => request<Item>('/items', { method: 'POST', body }),
    updateItem: (id, body) => request<Item>(`/items/${id}`, { method: 'PATCH', body }),
    deleteItem: (id) => request<undefined>(`/items/${id}`, { method: 'DELETE' }),
    addItemTag: (id, tag) => request<Item>(`/items/${id}/tags`, { method: 'POST', body: { tag } }),
    removeItemTag: (id, tagSlug) =>
      request<undefined>(`/items/${id}/tags/${tagSlug}`, { method: 'DELETE' }),

    getTags: () => request<TagList>('/tags'),
    renameTag: (id, name) => request<undefined>(`/tags/${id}`, { method: 'PATCH', body: { name } }),
    deleteTag: (id) => request<undefined>(`/tags/${id}`, { method: 'DELETE' }),

    extractArticle: (id) => request<ExtractAccepted>(`/items/${id}/extract`, { method: 'POST' }),
    getArticle: (id) => request<Article>(`/items/${id}/article`),

    listHighlights: (id) => request<HighlightList>(`/items/${id}/highlights`),
    createHighlight: (id, body) =>
      request<Highlight>(`/items/${id}/highlights`, { method: 'POST', body }),
    updateHighlight: (hid, body) =>
      request<Highlight>(`/highlights/${hid}`, { method: 'PATCH', body }),
    deleteHighlight: (hid) => request<undefined>(`/highlights/${hid}`, { method: 'DELETE' }),

    createToken: (body) => request<PersonalAccessTokenCreated>('/tokens', { method: 'POST', body }),
    listTokens: () => request<TokenList>('/tokens'),
    revokeToken: (id) => request<undefined>(`/tokens/${id}`, { method: 'DELETE' }),
  };
}

export type { PersonalAccessToken, PersonalAccessTokenCreated, TokenList, CreateTokenRequest };
