<script setup lang="ts">
  import { nextTick, onMounted, ref, watch } from 'vue';

  import { anchorHighlight, clearHighlights } from './highlight-mark';

  export type AppHighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

  export interface AppHighlightData {
    id: string;
    quote: string;
    prefix: string;
    suffix: string;
    color: AppHighlightColor;
  }

  const props = withDefaults(
    defineProps<{
      /** Server-sanitized HTML string. Sanitization is the backend's responsibility. */
      contentHtml: string;
      highlights?: AppHighlightData[];
    }>(),
    {
      highlights: () => [],
    },
  );

  const emit = defineEmits<{
    /** Fired when the user releases a text selection inside the body. */
    select: [{ quote: string; prefix: string; suffix: string }];
    /** Fired when the user clicks an existing highlight mark. */
    highlightClick: [id: string];
  }>();

  const bodyRef = ref<HTMLDivElement | null>(null);

  function reanchorHighlights(): void {
    const el = bodyRef.value;
    if (!el) return;
    clearHighlights(el);
    for (const h of props.highlights) {
      anchorHighlight(el, h);
    }
  }

  onMounted(() => {
    void nextTick(reanchorHighlights);
  });

  watch(
    () => [props.contentHtml, props.highlights] as const,
    () => {
      void nextTick(reanchorHighlights);
    },
  );

  function onBodyClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const mark = target.closest<HTMLElement>('mark[data-hl]');
    if (mark?.dataset['hl']) {
      emit('highlightClick', mark.dataset['hl']);
    }
  }

  function onMouseUp(): void {
    // WHY globalThis: use globalThis instead of window per unicorn/prefer-global-this rule.
    const selection = globalThis.getSelection();
    if (!selection || selection.isCollapsed) return;
    const el = bodyRef.value;
    if (!el) return;
    // Check the selection is within the body
    const range = selection.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;

    const quote = selection.toString().trim();
    if (!quote) return;

    // Compute prefix (up to 64 chars before) and suffix (up to 64 chars after).
    // WHY loop: textContent concatenates all text nodes so the quote may appear
    // multiple times. We use startContainer + startOffset to locate the character
    // position of the selection within the full textContent string, ensuring we
    // always pick the occurrence the user actually selected (not the first one).
    // el.textContent is non-null on a mounted HTMLDivElement (Vue-test-utils
    // ref type infers string directly).
    const text = el.textContent;
    const start = resolveSelectionStart(el, range, quote, text);
    if (start === -1) return;
    const prefix = text.slice(Math.max(0, start - 64), start);
    const suffix = text.slice(start + quote.length, start + quote.length + 64);

    emit('select', { quote, prefix, suffix });
  }

  /**
   * Resolve the character index of a text selection within `fullText`
   * (= el.textContent) by walking text nodes up to the selection's
   * startContainer, then adding startOffset.  Falls back to the first
   * occurrence of `quote` in `fullText` if walking fails.
   */
  function resolveSelectionStart(
    el: HTMLElement,
    range: Range,
    quote: string,
    fullText: string,
  ): number {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let charOffset = 0;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node === range.startContainer) {
        return charOffset + range.startOffset;
      }
      charOffset += (node.textContent ?? '').length;
    }
    // Fallback: first occurrence (pre-Fix behaviour; should rarely trigger).
    return fullText.indexOf(quote);
  }
</script>

<template>
  <article class="app-article-reader">
    <!--
      WHY v-html: contentHtml is server-sanitized HTML produced by the S2-backend
      extraction pipeline (S2-backend Task 4). The backend strips all unsafe markup
      (scripts, event attributes, external resources) before persisting the content.
      This component trusts that sanitization boundary — it must never be passed
      raw/unsanitized user input. Sanitization is the backend's responsibility.
      Single-node highlight ranges only; multi-node spans are a documented limitation.
    -->
    <!-- eslint-disable vue/no-v-html -- WHY: v-html is intentional here. contentHtml is server-sanitized by S2-backend Task 4 (DOMPurify). The prop name signals the trust boundary to consumers. -->
    <div
      ref="bodyRef"
      class="app-article-reader__body"
      @click="onBodyClick"
      @mouseup="onMouseUp"
      v-html="contentHtml"
    />
    <!-- eslint-enable vue/no-v-html -->
  </article>
</template>

<style lang="scss" scoped>
  .app-article-reader {
    display: grid;
    gap: var(--space-6);
    min-width: 0;

    // Reader body — generous leading for comfortable long-form reading.
    &__body {
      font-family: var(--font-reading);
      font-size: var(--text-lg);
      line-height: var(--leading-relaxed);
      color: var(--text-fg);
      max-width: 44rem;

      :deep(p) {
        margin: 0;
      }

      :deep(p + p) {
        margin-top: var(--space-5);
      }

      :deep(h2),
      :deep(h3) {
        font-family: var(--font-display);
        font-weight: var(--fw-semibold);
        line-height: var(--leading-tight);
        margin-top: var(--space-8);
        margin-bottom: var(--space-3);
      }
    }
  }

  // Highlight marks — soft content-color fills behind the running text.
  // box-decoration-break keeps the rounding clean across line wraps.
  // WHY: the --highlight-* tokens are defined in packages/ui/src/styles.css
  // @theme block (Task 3) because highlight colors are content-purpose colors
  // (the user's marks on the page), not chrome. They are warm-tuned to sit on
  // the paper surface and are not part of the DTCG token pipeline.
  :deep(.app-highlight) {
    color: inherit;
    background: transparent;
    border-radius: var(--radius-sm);
    padding-block: 0.06em;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    cursor: pointer;

    &--yellow {
      background: var(--highlight-yellow);
    }

    &--green {
      background: var(--highlight-green);
    }

    &--blue {
      background: var(--highlight-blue);
    }

    &--pink {
      background: var(--highlight-pink);
    }
  }
</style>
