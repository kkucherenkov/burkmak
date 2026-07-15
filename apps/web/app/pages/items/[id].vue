<script setup lang="ts">
  import {
    AppTagChip,
    AppButton,
    AppInput,
    AppStatusBadge,
    AppExtractState,
    AppArticleReader,
    AppHighlightPopover,
    AppHighlightCard,
    AppShelfPicker,
  } from '@app/ui';
  import type { AppHighlightColor, AppHighlightData, AppHighlightCardHighlight } from '@app/ui';
  import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';

  import { useArticle } from '~/composables/useArticle';
  import { useHighlights } from '~/composables/useHighlights';

  import type { components } from '@app/specs';

  definePageMeta({ middleware: 'auth' });

  type Item = components['schemas']['Item'];
  type Highlight = components['schemas']['Highlight'];

  const { t } = useI18n();
  const route = useRoute();
  const { public: pub } = useRuntimeConfig();
  const id = route.params.id as string;

  // Live extractStatus rides the list store + the global SSE stream: useEvents
  // opens the EventSource and, on item.updated, calls store.refetchOne(id),
  // which refreshes the item we read below via the computed.
  const store = useItems();
  useEvents();
  const item = computed<Item | null>(() => store.items.value.find((i) => i.id === id) ?? null);

  const article = useArticle(id);
  const highlights = useHighlights(id);
  const shelvesStore = useShelves();

  const newTag = ref('');
  const editingId = ref<string | null>(null);

  // ---- Inline action error feedback ---------------------------------------
  // Page-local affordance (no global toast): user-triggered async handlers run
  // through runAction, which surfaces a single dismissible banner on failure.
  const actionError = ref<string | null>(null);
  async function runAction(fn: () => Promise<void>): Promise<void> {
    actionError.value = null;
    try {
      await fn();
    } catch {
      actionError.value = t('reader.actionFailed');
    }
  }

  onMounted(async () => {
    void shelvesStore.load();
    await store.refetchOne(id);
    await highlights.load();
    await article.syncStatus(item.value?.extractStatus ?? 'none');
  });

  // Each SSE-driven item refresh re-feeds the article machine; syncStatus loads
  // the article body once the extraction reaches 'ready'.
  watch(
    () => item.value?.extractStatus,
    (s) => {
      if (s) void article.syncStatus(s);
    },
  );

  // WHY rewrite: Article.contentHtml carries root-relative image srcs like
  // `/api/v1/items/.../image/...`. When the web origin differs from the API
  // origin those resolve against the web host and 404. Prefix them with the
  // API origin only in that cross-origin case; same-origin passes through.
  const contentHtml = computed<string>(() => {
    const raw = article.article.value?.contentHtml ?? '';
    if (!raw) return '';
    const apiOrigin = new URL(pub.apiBaseUrl as string, globalThis.location.href).origin;
    if (apiOrigin === globalThis.location.origin) return raw;
    return raw.replaceAll('src="/api/v1/', `src="${apiOrigin}/api/v1/`);
  });

  // ---- Highlight mapping (OpenAPI Highlight -> reader/card shapes) ---------
  function toReaderHighlight(h: Highlight): AppHighlightData {
    return {
      id: h.id,
      quote: h.quote,
      prefix: h.prefix,
      suffix: h.suffix,
      color: h.color,
    };
  }
  function toCardData(h: Highlight): AppHighlightCardHighlight {
    return { ...toReaderHighlight(h), note: h.note };
  }
  const readerHighlights = computed<AppHighlightData[]>(() => {
    const hs: readonly Highlight[] = highlights.list.value;
    return hs.map((h) => toReaderHighlight(h));
  });

  // ---- Selection popover --------------------------------------------------
  interface Anchor {
    quote: string;
    prefix: string;
    suffix: string;
  }
  const pendingAnchor = ref<Anchor | null>(null);
  const popoverVisible = ref(false);
  const popoverX = ref(0);
  const popoverY = ref(0);
  const popoverRef = ref<HTMLElement | null>(null);

  function hidePopover(): void {
    popoverVisible.value = false;
    pendingAnchor.value = null;
  }

  function onSelect(anchor: Anchor): void {
    // AppArticleReader owns the DOM Selection and emits the resolved anchor
    // strings. We only read the live Selection here to position the popover.
    const sel = globalThis.getSelection();
    const rect = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).getBoundingClientRect() : null;
    pendingAnchor.value = anchor;
    popoverX.value = rect ? rect.left + rect.width / 2 : 0;
    popoverY.value = rect ? rect.top : 0;
    popoverVisible.value = true;
  }

  async function onPick(color: AppHighlightColor): Promise<void> {
    if (!pendingAnchor.value) return;
    await highlights.add({ ...pendingAnchor.value, color });
    hidePopover();
  }

  async function onAddNote(): Promise<void> {
    if (!pendingAnchor.value) return;
    // Create a highlight with a sensible default color, then open its card editor.
    const hl = await highlights.add({ ...pendingAnchor.value, color: 'yellow' });
    hidePopover();
    editingId.value = hl.id;
  }

  function focusHighlight(hid: string): void {
    editingId.value = hid;
  }

  async function onSaveNote(hid: string, note: string): Promise<void> {
    // Empty string clears the note (PATCH note:null) per the backend contract.
    await highlights.update(hid, { note: note || null });
    editingId.value = null;
  }

  // Hide the popover on scroll (its fixed coords would otherwise drift).
  function onScroll(): void {
    if (popoverVisible.value) hidePopover();
  }
  // Dismiss the popover on an outside pointerdown; keep it open when the press
  // lands inside (so swatches / add-note keep working). Capture phase mirrors
  // the scroll listener so it sees the event before inner handlers.
  function onPointerDown(event: PointerEvent): void {
    if (!popoverVisible.value) return;
    const target = event.target;
    if (popoverRef.value && target instanceof Node && popoverRef.value.contains(target)) return;
    hidePopover();
  }
  onMounted(() => {
    globalThis.addEventListener('scroll', onScroll, true);
    globalThis.addEventListener('pointerdown', onPointerDown, true);
  });
  onBeforeUnmount(() => {
    globalThis.removeEventListener('scroll', onScroll, true);
    globalThis.removeEventListener('pointerdown', onPointerDown, true);
  });

  // ---- Metadata controls (route through the store; guard on item) ---------
  async function setReadState(readState: Item['readState']): Promise<void> {
    if (!item.value) return;
    await store.setReadState(item.value, readState);
  }
  async function toggleFavorite(): Promise<void> {
    if (!item.value) return;
    await store.toggleFavorite(item.value);
  }
  async function addTag(): Promise<void> {
    if (!item.value || !newTag.value.trim()) return;
    await store.addTag(item.value, newTag.value.trim());
    newTag.value = '';
  }
  async function removeTag(slug: string): Promise<void> {
    if (!item.value) return;
    await store.removeTag(item.value, slug);
  }
  async function remove(): Promise<void> {
    if (!item.value) return;
    await store.remove(id);
    await navigateTo('/library');
  }

  // Shelf membership is server-owned: re-read the item after each toggle
  // rather than patching item.shelves locally (see slice ②'s refetchOne).
  async function onToggleShelf(shelfId: string, next: boolean): Promise<void> {
    if (!item.value) return;
    await (next
      ? shelvesStore.addItem(shelfId, item.value.id)
      : shelvesStore.removeItem(shelfId, item.value.id));
    await store.refetchOne(id);
  }

  const readerLabels = computed(() => ({
    pitch: t('reader.pitch'),
    extract: t('reader.extract'),
    extracting: t('reader.extracting'),
    failed: t('reader.failed'),
    retry: t('reader.retry'),
  }));
  const popoverLabels = computed(() => ({ addNote: t('highlight.addNote') }));
  const shelfLabels = computed(() => ({
    add: t('shelves.addToShelf'),
    remove: t('shelves.removeFromShelf'),
    empty: t('shelves.pickerEmpty'),
  }));
  const cardLabels = computed(() => ({
    edit: t('highlight.edit'),
    delete: t('highlight.delete'),
    save: t('highlight.save'),
    cancel: t('highlight.cancel'),
    notePlaceholder: t('highlight.notePlaceholder'),
  }));
</script>

<template>
  <article v-if="item" class="page-detail">
    <header class="page-detail__bar">
      <NuxtLink to="/library" class="page-detail__back">
        {{ t('itemDetail.back') }}
      </NuxtLink>
      <div class="page-detail__bar-actions">
        <AppButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-archive"
          :label="t('itemDetail.archive')"
          @click="runAction(() => setReadState('archived'))"
        />
        <AppButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-trash-2"
          :label="t('itemDetail.delete')"
          @click="runAction(() => remove())"
        />
      </div>
    </header>

    <p v-if="actionError" class="page-detail__error" role="alert">
      <span class="page-detail__error-text">{{ actionError }}</span>
      <button
        type="button"
        class="page-detail__error-dismiss"
        :aria-label="t('reader.dismiss')"
        @click="actionError = null"
      >
        <span aria-hidden="true">×</span>
      </button>
    </p>

    <h1 class="page-detail__title">
      {{ item.title ?? item.url }}
    </h1>

    <p class="page-detail__meta">
      <span>{{ item.siteName ?? item.url }}</span>
      <AppStatusBadge
        v-if="item.status !== 'ready'"
        :status="item.status"
        :label="t('itemDetail.status')"
      />
    </p>

    <figure v-if="item.leadImageUrl" class="page-detail__lead">
      <img :src="item.leadImageUrl" alt="" />
    </figure>

    <p v-if="item.excerpt" class="page-detail__excerpt">
      {{ item.excerpt }}
    </p>

    <div class="page-detail__tags">
      <AppTagChip
        v-for="tag in item.tags"
        :key="tag"
        :label="tag"
        removable
        @remove="runAction(() => removeTag(tag))"
      />
      <form class="page-detail__add-tag" @submit.prevent="runAction(() => addTag())">
        <AppInput v-model="newTag" type="text" :placeholder="t('itemDetail.addTag')" size="sm" />
      </form>
    </div>

    <section class="page-detail__shelves">
      <h2 class="page-detail__shelves-title">{{ t('shelves.title') }}</h2>
      <AppShelfPicker
        :shelves="shelvesStore.shelves.value"
        :selected-ids="item.shelves.map((s) => s.id)"
        :labels="shelfLabels"
        @toggle="onToggleShelf"
      />
    </section>

    <div class="page-detail__controls">
      <AppButton
        size="sm"
        variant="outline"
        color="neutral"
        :label="t('itemDetail.read.unread')"
        @click="runAction(() => setReadState('unread'))"
      />
      <AppButton
        size="sm"
        variant="outline"
        color="neutral"
        :label="t('itemDetail.read.read')"
        @click="runAction(() => setReadState('read'))"
      />
      <AppButton
        size="sm"
        variant="outline"
        color="neutral"
        :label="t('itemDetail.read.archived')"
        @click="runAction(() => setReadState('archived'))"
      />
      <AppButton
        size="sm"
        :variant="item.favorite ? 'solid' : 'outline'"
        :color="item.favorite ? 'primary' : 'neutral'"
        :label="t('itemDetail.favorite')"
        @click="runAction(() => toggleFavorite())"
      />
    </div>

    <!-- Reader: extract affordance until ready, then the article + highlights -->
    <AppExtractState
      v-if="article.status.value !== 'ready'"
      :status="article.status.value"
      :labels="readerLabels"
      @extract="runAction(() => article.extract())"
    />

    <div v-else class="page-detail__reader">
      <AppArticleReader
        class="page-detail__article"
        :content-html="contentHtml"
        :highlights="readerHighlights"
        @select="onSelect"
        @highlight-click="focusHighlight"
      />

      <aside class="page-detail__panel" :aria-label="t('reader.highlights')">
        <header class="page-detail__panel-head">
          <h2 class="page-detail__panel-title">
            {{ t('reader.highlights') }}
          </h2>
          <span class="page-detail__panel-count">{{ highlights.list.value.length }}</span>
        </header>
        <ul class="page-detail__panel-list">
          <li v-for="h in highlights.list.value" :key="h.id">
            <AppHighlightCard
              :highlight="toCardData(h)"
              :editing="editingId === h.id"
              :labels="cardLabels"
              @edit="editingId = h.id"
              @cancel="editingId = null"
              @delete="runAction(() => highlights.remove(h.id))"
              @save="runAction(() => onSaveNote(h.id, $event))"
            />
          </li>
        </ul>
      </aside>
    </div>

    <!--
      Selection popover. WHY :style CSS-var binding: the popover is fixed to the
      live selection rect, which is only known at runtime. Passing the coords as
      custom properties (consumed by scoped SCSS below) is the one sanctioned way
      to feed runtime coordinates without a static inline style="" attribute.
    -->
    <div
      v-if="popoverVisible"
      ref="popoverRef"
      class="page-detail__popover"
      :style="{ '--popover-x': popoverX + 'px', '--popover-y': popoverY + 'px' }"
    >
      <AppHighlightPopover
        :labels="popoverLabels"
        @pick="runAction(() => onPick($event))"
        @add-note="runAction(() => onAddNote())"
      />
    </div>
  </article>
</template>

<style scoped lang="scss">
  .page-detail {
    max-width: 72rem;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    background: var(--surface-page);
    color: var(--text-fg);
    font-family: var(--font-sans);
    min-height: 100dvh;

    &__bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      font-weight: var(--fw-semibold);
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-md);
      padding: var(--space-1) var(--space-2);
      transition:
        color var(--dur-fast) var(--ease),
        background var(--dur-fast) var(--ease);

      &:hover {
        color: var(--text-fg);
        background: var(--surface-raised);
      }

      &:focus-visible {
        outline: 2px solid var(--brand-accent);
        outline-offset: 2px;
      }
    }

    &__bar-actions {
      display: flex;
      gap: var(--space-2);
    }

    &__error {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin: 0;
      padding: var(--space-3) var(--space-4);
      color: var(--status-error-fg);
      background: var(--status-error-subtle);
      border: 1px solid var(--status-error-fg);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      font-weight: var(--fw-medium);
    }

    &__error-text {
      min-width: 0;
    }

    &__error-dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--space-6);
      height: var(--space-6);
      flex: none;
      padding: 0;
      color: inherit;
      background: transparent;
      border: 0;
      border-radius: var(--radius-md);
      font-size: var(--text-lg);
      line-height: 1;
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease);

      &:hover {
        background: var(--surface-raised);
      }

      &:focus-visible {
        outline: 2px solid var(--status-error-fg);
        outline-offset: 2px;
      }
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
      text-wrap: balance;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin: 0;
    }

    &__lead {
      margin: 0;

      img {
        width: 100%;
        border-radius: var(--radius-2xl);
        border: 1px solid var(--border-default);
        display: block;
      }
    }

    &__excerpt {
      margin: 0;
      font-family: var(--font-reading);
      font-size: var(--text-xl);
      line-height: var(--leading-relaxed);
      color: var(--text-secondary);
      max-width: 60ch;
      text-wrap: pretty;
    }

    &__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }

    &__add-tag {
      display: inline-flex;
      align-items: center;
      width: 8rem;
    }

    &__shelves {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-width: 28rem;
    }

    &__shelves-title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-lg);
      line-height: var(--leading-snug);
      color: var(--text-fg);
    }

    &__controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    // Reader + highlights panel: panel beside the article on wide widths,
    // collapsing below it when narrow.
    &__reader {
      display: grid;
      grid-template-columns: minmax(0, 44rem) minmax(16rem, 22rem);
      gap: clamp(var(--space-6), 4vw, var(--space-12));
      align-items: start;
    }

    &__article {
      min-width: 0;
    }

    &__panel {
      position: sticky;
      top: var(--space-6);
      display: grid;
      gap: var(--space-4);
      padding: var(--space-5);
      background: var(--surface-raised);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-sm);
    }

    &__panel-head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    &__panel-title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-xl);
      line-height: var(--leading-snug);
      color: var(--text-fg);
    }

    &__panel-count {
      display: grid;
      place-items: center;
      min-width: var(--space-6);
      height: var(--space-6);
      padding-inline: var(--space-2);
      font-size: var(--text-xs);
      font-weight: var(--fw-semibold);
      color: var(--brand-accent);
      background: var(--brand-accent-subtle);
      border-radius: var(--radius-pill);
    }

    &__panel-list {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    // Runtime-positioned selection popover. Coordinates arrive as --popover-x /
    // --popover-y custom properties (set via :style in the template). The
    // translate centers the popover horizontally and lifts it above the rect.
    &__popover {
      position: fixed;
      left: var(--popover-x);
      top: var(--popover-y);
      transform: translate(-50%, calc(-100% - var(--space-3)));
      z-index: var(--z-overlay);
    }
  }

  @media (max-width: 56rem) {
    .page-detail__reader {
      grid-template-columns: minmax(0, 1fr);
    }

    .page-detail__panel {
      position: static;
    }
  }
</style>
