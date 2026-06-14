import type { Ref } from 'vue';

import type { components } from '@app/specs';

type Article = components['schemas']['Article'];
type ExtractStatus = components['schemas']['ExtractStatus'];

export interface UseArticleReturn {
  article: Ref<Article | null>;
  status: Ref<ExtractStatus>;
  loadArticle(): Promise<void>;
  extract(): Promise<void>;
  syncStatus(next: ExtractStatus): Promise<void>;
}

/**
 * Manages article content and extraction status for a single item.
 *
 * DECOUPLED from useEvents/useItems by design. The page is responsible for
 * feeding `syncStatus` from the SSE-refreshed item: `useEvents` → `refetchOne`
 * refreshes the item in the list store; the page watches
 * `useItems().items.find(i => i.id === id).extractStatus` and calls
 * `syncStatus(next)` on each change (initial load + each `item.updated` event).
 * This keeps the composable free of any global-store coupling.
 */
export function useArticle(id: string): UseArticleReturn {
  const api = useApi();
  const article = useState<Article | null>(`article:${id}`, () => null);
  const status = useState<ExtractStatus>(`article:status:${id}`, () => 'none');
  // Prevents the mount-race double-fetch: onMounted calls syncStatus('ready') and the
  // extractStatus watcher fires simultaneously; both pass the article===null guard before
  // the first GET /article resolves. This flag collapses concurrent calls to one fetch.
  const loadingArticle = ref(false);

  async function loadArticle(): Promise<void> {
    if (loadingArticle.value) return;
    loadingArticle.value = true;
    try {
      article.value = await api.getArticle(id);
    } catch (error) {
      // 404 = article not yet extracted — expected before a ready state; swallow it.
      // Any other status (401, 500, network) is unexpected — re-throw so the caller can surface it.
      const httpStatus =
        (error as { response?: { status?: number }; statusCode?: number }).response?.status ??
        (error as { statusCode?: number }).statusCode;
      if (httpStatus === 404) {
        article.value = null;
        return;
      }
      throw error;
    } finally {
      loadingArticle.value = false;
    }
  }

  async function extract(): Promise<void> {
    // Guard against concurrent duplicate extract calls that would leave UI in a stuck 'extracting' state.
    if (status.value === 'extracting') return;
    const prev = status.value;
    status.value = 'extracting';
    try {
      const res = await api.extractArticle(id);
      status.value = res.extractStatus;
    } catch (error) {
      // Restore previous status so the UI is not left spinning forever.
      status.value = prev;
      throw error;
    }
  }

  async function syncStatus(next: ExtractStatus): Promise<void> {
    status.value = next;
    if (next === 'ready' && article.value === null) {
      await loadArticle();
    }
  }

  return { article, status, loadArticle, extract, syncStatus };
}
