<script setup lang="ts">
  /**
   * burkmak — Add link (quick-add).
   *
   * Near drop-in reference for `@app/ui`. Self-contained: no imports beyond Vue.
   * Styles ONLY through the canonical token contract (tokens.preview.css) —
   * --brand-accent, --surface-page, --text-fg, --radius-*, --space-*, --dur-*, …
   * The component defines NO token values; the host app supplies them and the
   * `theme` prop sets data-theme so the right light/dark set cascades in.
   *
   * Two presentations of the SAME quick-add form:
   *   1. AppAddBar — a persistent inline bar pinned to the top of the library.
   *   2. AppModal  — a centered sheet (bottom-sheet on small screens) holding
   *      the identical field, invoked from the header button / keyboard.
   *
   * States, all reachable by interaction:
   *   idle → typing/validating (live note) → invalid-URL error (submit a non-URL)
   *   → just-saved (a `pending` AppItemCard is prepended while metadata fetches,
   *   then walks pending → extracting → ready, mirroring library.vue).
   *
   * Markup stands in for these primitives (extract by root class + comment):
   *   app-add-bar · app-modal · app-input · app-button
   *   app-item-card · app-status-badge · app-skeleton · app-tag-chip
   */
  import { computed, nextTick, ref } from 'vue';

  type ItemStatus = 'pending' | 'extracting' | 'ready' | 'failed';
  type NoteKind = 'hint' | 'ok' | 'error';

  interface SavedItem {
    id: string;
    title: string;
    site: string;
    url: string;
    savedAt: string;
    excerpt: string;
    tags: string[];
    status: ItemStatus;
  }

  withDefaults(defineProps<{ theme?: 'light' | 'dark' }>(), { theme: 'light' });

  /** Permissive but honest: full address or bare host, optional scheme + path. */
  const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

  const STATUS_LABEL: Record<ItemStatus, string> = {
    pending: 'Saving',
    extracting: 'Extracting',
    ready: 'Ready',
    failed: 'Failed',
  };

  const IDLE_HINT = 'Paste a link — burkmak fetches a clean reader view and keeps it for later.';

  /** A small already-saved library so the freshly-added card lands in context. */
  const SEED: SavedItem[] = [
    {
      id: 's1',
      title: 'The case for reading on paper, on a screen',
      site: 'newyorker.com',
      url: 'https://www.newyorker.com/culture/annals-of-inquiry/reading-on-a-screen',
      savedAt: '2h ago',
      excerpt:
        'Screens trained us to skim. A handful of small interface choices can teach them to slow back down — and why that matters for what we keep.',
      tags: ['reading', 'longread'],
      status: 'ready',
    },
    {
      id: 's2',
      title: 'Notes on building a calmer reading queue',
      site: 'craigmod.com',
      url: 'https://craigmod.com/essays/a-calmer-queue/',
      savedAt: 'Yesterday',
      excerpt:
        'The hardest part of a reading queue is not collecting — it is forgetting gracefully. A library should feel like a shelf, not a backlog that nags.',
      tags: ['product', 'reading'],
      status: 'ready',
    },
  ];

  const items = ref<SavedItem[]>([...SEED]);
  let seq = 0;

  /* ----------------------------------------------------- url helpers */
  function normalize(raw: string): string {
    const v = raw.trim();
    return v.includes('://') ? v : `https://${v}`;
  }
  function hostOf(raw: string): string {
    try {
      return new URL(normalize(raw)).hostname.replace(/^www\./, '');
    } catch {
      return raw
        .trim()
        .replace(/^https?:\/\//, '')
        .split('/')[0];
    }
  }
  /** Provisional human title from the URL slug, used once metadata "arrives". */
  function titleFromUrl(raw: string): string {
    try {
      const u = new URL(normalize(raw));
      const seg = u.pathname.split('/').filter(Boolean).pop() ?? '';
      const words = decodeURIComponent(seg)
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      if (!words) return hostOf(raw);
      return words.charAt(0).toUpperCase() + words.slice(1);
    } catch {
      return hostOf(raw);
    }
  }

  /** Shared save pipeline used by BOTH the inline bar and the modal sheet. */
  function commitSave(raw: string) {
    const id = `new-${seq++}`;
    const site = hostOf(raw);
    items.value = [
      {
        id,
        title: site,
        site,
        url: normalize(raw),
        savedAt: 'Just now',
        excerpt: '',
        tags: [],
        status: 'pending',
      },
      ...items.value,
    ];
    // pending → extracting → ready (mirrors library.vue's fetch simulation).
    window.setTimeout(() => setStatus(id, 'extracting'), 1100);
    window.setTimeout(() => {
      items.value = items.value.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'ready',
              title: titleFromUrl(i.url),
              excerpt:
                'Reader view ready — open to read the full article, highlight, and sync to your devices.',
            }
          : i,
      );
    }, 2400);
  }
  function setStatus(id: string, status: ItemStatus) {
    items.value = items.value.map((i) => (i.id === id ? { ...i, status } : i));
  }

  const isFetching = (s: ItemStatus) => s === 'pending' || s === 'extracting';
  const initial = (site: string) => site.charAt(0).toUpperCase();

  /* ----------------------------------------------- 1 · inline add bar */
  const url = ref('');
  const saving = ref(false);
  const note = ref<{ kind: NoteKind; text: string }>({ kind: 'hint', text: IDLE_HINT });

  const looksValid = computed(() => URL_RE.test(url.value.trim()));
  const invalid = computed(() => note.value.kind === 'error');

  function onInput() {
    const v = url.value.trim();
    if (!v) note.value = { kind: 'hint', text: IDLE_HINT };
    else if (looksValid.value)
      note.value = { kind: 'ok', text: 'Looks like a link — press Save to keep it.' };
    else
      note.value = {
        kind: 'hint',
        text: 'Keep typing a full address, e.g. https://example.com/article.',
      };
  }

  function onSave() {
    const raw = url.value.trim();
    if (!raw) {
      note.value = { kind: 'error', text: 'Paste a link to save.' };
      return;
    }
    if (!URL_RE.test(raw)) {
      note.value = {
        kind: 'error',
        text: 'That doesn’t look like a link. Try a full address like https://example.com/article.',
      };
      return;
    }
    // brief reachability check → the "validating" moment
    saving.value = true;
    note.value = { kind: 'hint', text: 'Checking link…' };
    window.setTimeout(() => {
      commitSave(raw);
      saving.value = false;
      url.value = '';
      note.value = { kind: 'ok', text: 'Saved — fetching a clean reader view.' };
      window.setTimeout(() => {
        if (note.value.kind === 'ok') note.value = { kind: 'hint', text: IDLE_HINT };
      }, 2600);
    }, 700);
  }

  /* --------------------------------------------------- 2 · modal sheet */
  const modalOpen = ref(false);
  const mUrl = ref('');
  const mSaving = ref(false);
  const mNote = ref<{ kind: NoteKind; text: string }>({
    kind: 'hint',
    text: 'We’ll grab the title, a clean excerpt, and a reader view automatically.',
  });
  const mInput = ref<HTMLInputElement | null>(null);

  function openModal() {
    modalOpen.value = true;
    mUrl.value = '';
    mNote.value = {
      kind: 'hint',
      text: 'We’ll grab the title, a clean excerpt, and a reader view automatically.',
    };
    nextTick(() => mInput.value?.focus());
  }
  function closeModal() {
    modalOpen.value = false;
  }
  function onModalInput() {
    if (mNote.value.kind === 'error') {
      mNote.value = {
        kind: 'hint',
        text: 'We’ll grab the title, a clean excerpt, and a reader view automatically.',
      };
    }
  }
  function onModalSave() {
    const raw = mUrl.value.trim();
    if (!raw) {
      mNote.value = { kind: 'error', text: 'Paste a link to save.' };
      return;
    }
    if (!URL_RE.test(raw)) {
      mNote.value = {
        kind: 'error',
        text: 'That doesn’t look like a link. Try a full address like https://example.com/article.',
      };
      return;
    }
    mSaving.value = true;
    window.setTimeout(() => {
      commitSave(raw);
      mSaving.value = false;
      modalOpen.value = false;
    }, 700);
  }
</script>

<template>
  <div class="app-add-link" :data-theme="theme">
    <div class="app-add-link__inner">
      <header class="app-add-link__head">
        <div>
          <h1 class="app-add-link__title">Library</h1>
          <p class="app-add-link__subtitle">
            {{ items.length }} saved · paste anything worth reading later
          </p>
        </div>
        <!-- @app/ui: AppButton (opens the modal presentation) -->
        <button
          class="app-button app-button--ghost app-add-link__open"
          type="button"
          @click="openModal"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <span>Save a link</span>
          <kbd class="app-add-link__kbd" aria-hidden="true">N</kbd>
        </button>
      </header>

      <!-- ============================ 1 · inline add bar ============================ -->
      <!-- @app/ui: AppAddBar -->
      <form
        class="app-add-bar"
        :class="{ 'app-add-bar--saving': saving }"
        novalidate
        @submit.prevent="onSave"
      >
        <div class="app-add-bar__field">
          <svg
            class="app-add-bar__icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 15l6-6" />
            <path d="M11 6l1-1a4 4 0 0 1 6 6l-2 2" />
            <path d="M13 18l-1 1a4 4 0 0 1-6-6l2-2" />
          </svg>
          <!-- @app/ui: AppInput -->
          <input
            v-model="url"
            class="app-input app-input--lead"
            type="url"
            inputmode="url"
            autocomplete="off"
            spellcheck="false"
            placeholder="https://example.com/article"
            aria-label="Link to save"
            :aria-invalid="invalid ? 'true' : undefined"
            aria-describedby="add-bar-note"
            :disabled="saving"
            @input="onInput"
          />
        </div>
        <!-- @app/ui: AppButton -->
        <button
          class="app-button app-add-bar__submit"
          type="submit"
          :aria-busy="saving || undefined"
          :disabled="saving"
        >
          <span v-if="saving" class="app-spinner" aria-hidden="true" />
          <span>{{ saving ? 'Saving…' : 'Save' }}</span>
        </button>
        <p
          id="add-bar-note"
          class="app-add-bar__note"
          :class="`app-add-bar__note--${note.kind}`"
          :role="invalid ? 'alert' : 'status'"
        >
          <span v-if="note.kind !== 'hint'" class="app-add-bar__note-dot" aria-hidden="true" />
          {{ note.text }}
        </p>
      </form>

      <!-- ============================ saved list (just-saved lands here) ============================ -->
      <div class="app-list">
        <!-- @app/ui: AppItemCard -->
        <article
          v-for="item in items"
          :key="item.id"
          class="app-item-card"
          :class="{ 'app-item-card--fresh': item.savedAt === 'Just now' }"
        >
          <span class="app-item-card__favicon" aria-hidden="true">{{ initial(item.site) }}</span>

          <div class="app-item-card__body">
            <div class="app-item-card__title-row">
              <h3 class="app-item-card__title">{{ item.title }}</h3>
              <!-- @app/ui: AppStatusBadge -->
              <span
                v-if="item.status !== 'ready'"
                class="app-status-badge"
                :class="`app-status-badge--${item.status}`"
              >
                <span class="app-status-badge__dot" aria-hidden="true" />
                {{ STATUS_LABEL[item.status] }}
              </span>
            </div>

            <div class="app-item-card__meta">
              <span>{{ item.site }}</span>
              <span class="app-item-card__sep" aria-hidden="true" />
              <span>{{ item.savedAt }}</span>
            </div>

            <div
              v-if="isFetching(item.status)"
              class="app-item-card__fetching"
              role="status"
              aria-label="Fetching article"
            >
              <span class="app-skeleton app-skeleton--line app-skeleton--w90" />
              <span class="app-skeleton app-skeleton--line app-skeleton--w70" />
            </div>
            <p v-else class="app-item-card__excerpt">{{ item.excerpt }}</p>

            <div v-if="item.tags.length" class="app-item-card__tags">
              <!-- @app/ui: AppTagChip -->
              <span v-for="tag in item.tags" :key="tag" class="app-tag-chip">#{{ tag }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- ============================ 2 · modal sheet ============================ -->
    <Transition name="app-modal">
      <!-- @app/ui: AppModal -->
      <div v-if="modalOpen" class="app-modal" @keydown.esc="closeModal">
        <div class="app-modal__backdrop" @click="closeModal" />
        <div
          class="app-modal__sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
        >
          <header class="app-modal__head">
            <h2 id="add-modal-title" class="app-modal__title">Save a link</h2>
            <button
              class="app-icon-btn app-modal__close"
              type="button"
              aria-label="Close"
              @click="closeModal"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </header>

          <form class="app-modal__body" novalidate @submit.prevent="onModalSave">
            <div class="app-field">
              <label class="app-field__label" for="modal-url">Article URL</label>
              <div class="app-add-bar__field">
                <svg
                  class="app-add-bar__icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 15l6-6" />
                  <path d="M11 6l1-1a4 4 0 0 1 6 6l-2 2" />
                  <path d="M13 18l-1 1a4 4 0 0 1-6-6l2-2" />
                </svg>
                <!-- @app/ui: AppInput -->
                <input
                  id="modal-url"
                  ref="mInput"
                  v-model="mUrl"
                  class="app-input app-input--lead"
                  type="url"
                  inputmode="url"
                  autocomplete="off"
                  spellcheck="false"
                  placeholder="https://example.com/article"
                  :aria-invalid="mNote.kind === 'error' ? 'true' : undefined"
                  aria-describedby="modal-note"
                  :disabled="mSaving"
                  @input="onModalInput"
                />
              </div>
              <p
                id="modal-note"
                class="app-add-bar__note"
                :class="`app-add-bar__note--${mNote.kind}`"
                :role="mNote.kind === 'error' ? 'alert' : 'status'"
              >
                <span
                  v-if="mNote.kind !== 'hint'"
                  class="app-add-bar__note-dot"
                  aria-hidden="true"
                />
                {{ mNote.text }}
              </p>
            </div>

            <div class="app-modal__foot">
              <button
                class="app-button app-button--ghost"
                type="button"
                :disabled="mSaving"
                @click="closeModal"
              >
                Cancel
              </button>
              <!-- @app/ui: AppButton -->
              <button
                class="app-button"
                type="submit"
                :aria-busy="mSaving || undefined"
                :disabled="mSaving"
              >
                <span v-if="mSaving" class="app-spinner" aria-hidden="true" />
                <span>{{ mSaving ? 'Saving…' : 'Save to library' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
  /* Tokens come from the global contract (tokens.preview.css). This component
 * defines none — it only consumes canonical vars. The sole raw px are 1px
 * hairline borders, 3px focus-ring spreads, the 2px spinner stroke, and small
 * decorative dots (no matching tokens exist in the contract). */

  .app-add-link {
    min-height: 100dvh;
    padding: clamp(var(--space-5), 5vw, var(--space-14)) clamp(var(--space-4), 5vw, var(--space-6));
    background: var(--surface-page);
    color: var(--text-fg);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    -webkit-font-smoothing: antialiased;

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    &__inner {
      width: min(100%, 48rem);
      margin-inline: auto;
    }

    &__head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-5);
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl));
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
    }

    &__subtitle {
      margin: var(--space-1) 0 0;
      font-size: var(--text-md);
      color: var(--text-secondary);
    }

    &__open {
      flex: none;
      width: auto;
    }

    &__kbd {
      display: inline-grid;
      place-items: center;
      min-width: var(--space-5);
      padding: 0 var(--space-1);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--text-secondary);
      background: var(--surface-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
    }
  }

  /* ------------------------------------------------------- AppAddBar */
  .app-add-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    padding: var(--space-3);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    transition:
      border-color var(--dur-base) var(--ease-default),
      box-shadow var(--dur-base) var(--ease-default);

    &:focus-within {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
    }

    &__field {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 0;
    }

    &__icon {
      position: absolute;
      left: var(--space-3);
      color: var(--text-tertiary);
      pointer-events: none;
    }

    &__submit {
      width: auto;
      margin: 0;
      white-space: nowrap;
    }

    &__note {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin: 0;
      padding-inline: var(--space-1);
      font-size: var(--text-sm);
      line-height: var(--leading-snug);
      color: var(--text-tertiary);

      &--ok {
        color: var(--status-success-fg);
      }

      &--error {
        color: var(--status-error-fg);
      }
    }

    &__note-dot {
      flex: none;
      width: 6px;
      height: 6px;
      border-radius: var(--radius-pill);
      background: currentColor;
    }
  }

  @media (max-width: 32rem) {
    .app-add-bar {
      grid-template-columns: 1fr;
    }
    .app-add-bar__submit {
      width: 100%;
    }
  }

  /* --------------------------------------------------------- AppInput */
  .app-input {
    width: 100%;
    font: inherit;
    font-size: var(--text-md);
    color: var(--text-fg);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    transition:
      border-color var(--dur-base) var(--ease-default),
      box-shadow var(--dur-base) var(--ease-default);

    &::placeholder {
      color: var(--text-tertiary);
    }

    &--lead {
      padding-inline-start: var(--space-10);
    }

    &:focus-visible {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }

    &:disabled {
      color: var(--text-disabled);
      background: var(--surface-surface);
      cursor: not-allowed;
    }

    &[aria-invalid='true'] {
      border-color: var(--status-error-fg);

      &:focus-visible {
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--status-error-fg) 30%, transparent);
      }
    }
  }

  /* -------------------------------------------------------- AppButton */
  .app-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font: inherit;
    font-weight: var(--fw-semibold);
    font-size: var(--text-md);
    color: var(--brand-accent-fg);
    background: var(--brand-accent);
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-5);
    cursor: pointer;
    transition:
      background var(--dur-base) var(--ease-default),
      transform var(--dur-fast) var(--ease-default);

    &:hover:not(:disabled) {
      background: var(--brand-accent-hover);
    }

    &:active:not(:disabled) {
      background: var(--brand-accent-active);
      transform: translateY(1px);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 38%, transparent);
    }

    &[aria-busy='true'] {
      cursor: progress;
      opacity: 0.88;
    }

    &:disabled:not([aria-busy='true']) {
      color: var(--text-disabled);
      background: var(--surface-surface);
      cursor: not-allowed;
    }

    &--ghost {
      color: var(--text-fg);
      background: transparent;
      border-color: var(--border-default);

      &:hover:not(:disabled) {
        background: var(--surface-surface);
        border-color: var(--border-strong);
      }

      &:active:not(:disabled) {
        background: var(--surface-surface);
      }

      &:disabled {
        color: var(--text-disabled);
        background: transparent;
      }
    }
  }

  .app-spinner {
    flex: none;
    width: var(--space-4);
    height: var(--space-4);
    border: 2px solid color-mix(in oklab, var(--brand-accent-fg) 40%, transparent);
    border-top-color: var(--brand-accent-fg);
    border-radius: var(--radius-pill);
    animation: app-spin 0.7s linear infinite;
  }

  /* ---------------------------------------------------------- AppList */
  .app-list {
    display: grid;
    gap: var(--space-3);
  }

  /* ------------------------------------------------------ AppItemCard */
  .app-item-card {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    transition:
      border-color var(--dur-base) var(--ease-default),
      box-shadow var(--dur-base) var(--ease-default);

    &:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
    }

    /* freshly-saved card gets the one calm load flourish + an accent edge */
    &--fresh {
      border-color: color-mix(in oklab, var(--brand-accent) 45%, var(--border-default));
      animation: app-rise var(--dur-slow) var(--ease-out) both;
    }

    &__favicon {
      display: grid;
      place-items: center;
      width: var(--space-10);
      height: var(--space-10);
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-lg);
      color: var(--brand-accent);
      background: var(--surface-surface);
      border-radius: var(--radius-lg);
    }

    &__body {
      display: grid;
      align-content: start;
      gap: var(--space-1);
      min-width: 0;
    }

    &__title-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-lg);
      line-height: var(--leading-snug);
      letter-spacing: var(--tracking-tight);
      color: var(--text-fg);
      text-wrap: pretty;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    &__sep {
      width: 3px;
      height: 3px;
      border-radius: var(--radius-pill);
      background: currentColor;
      opacity: 0.55;
    }

    &__fetching {
      display: grid;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    &__excerpt {
      margin: var(--space-1) 0 0;
      font-family: var(--font-reading);
      font-size: var(--text-md);
      line-height: var(--leading-normal);
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
  }

  /* -------------------------------------------------------- AppTagChip */
  .app-tag-chip {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--fw-medium);
    color: var(--text-secondary);
    background: var(--surface-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);
  }

  /* ---------------------------------------------------- AppStatusBadge */
  .app-status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--fw-semibold);
    letter-spacing: var(--tracking-wide);
    white-space: nowrap;
    border-radius: var(--radius-pill);

    &__dot {
      width: 6px;
      height: 6px;
      border-radius: var(--radius-pill);
      background: currentColor;
    }

    &--pending {
      color: var(--status-info-fg);
      background: var(--status-info-subtle);
    }

    &--extracting {
      color: var(--status-warning-fg);
      background: var(--status-warning-subtle);
    }

    &--failed {
      color: var(--status-error-fg);
      background: var(--status-error-subtle);
    }

    &--pending &__dot,
    &--extracting &__dot {
      animation: app-pulse 1.3s var(--ease-default) infinite;
    }
  }

  /* -------------------------------------------------------- AppSkeleton */
  .app-skeleton {
    display: block;
    background: linear-gradient(
      90deg,
      var(--surface-surface) 8%,
      color-mix(in oklab, var(--surface-surface), var(--text-fg) 6%) 24%,
      var(--surface-surface) 40%
    );
    background-size: 200% 100%;
    border-radius: var(--radius-sm);
    animation: app-shimmer 1.4s linear infinite;

    &--line {
      height: var(--space-3);
    }

    &--w90 {
      width: 90%;
    }

    &--w70 {
      width: 70%;
    }
  }

  /* -------------------------------------------------------- AppIconBtn */
  .app-icon-btn {
    display: grid;
    place-items: center;
    width: var(--space-8);
    height: var(--space-8);
    color: var(--text-tertiary);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      color var(--dur-fast) var(--ease-default),
      background var(--dur-fast) var(--ease-default);

    &:hover {
      color: var(--text-fg);
      background: var(--surface-surface);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }

  /* ----------------------------------------------------------- AppModal */
  .app-modal {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: var(--space-4);

    &__backdrop {
      position: absolute;
      inset: 0;
      background: color-mix(in oklab, var(--text-fg) 42%, transparent);
      backdrop-filter: blur(2px);
    }

    &__sheet {
      position: relative;
      width: min(100%, 30rem);
      background: var(--surface-overlay);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
      padding: clamp(var(--space-5), 4vw, var(--space-6));
    }

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-2xl);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
      color: var(--text-fg);
    }

    &__close {
      flex: none;
    }

    &__body {
      display: grid;
      gap: var(--space-5);
    }

    &__foot {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }
  }

  .app-field {
    display: grid;
    gap: var(--space-2);

    &__label {
      font-size: var(--text-sm);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
    }
  }

  /* bottom-sheet on small screens */
  @media (max-width: 32rem) {
    .app-modal {
      place-items: end stretch;
      padding: 0;
    }
    .app-modal__sheet {
      width: 100%;
      border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
      padding-bottom: max(var(--space-6), env(safe-area-inset-bottom));
    }
    .app-modal__foot {
      flex-direction: column-reverse;
    }
    .app-modal__foot .app-button {
      width: 100%;
    }
  }

  /* modal enter/leave (Vue <Transition name="app-modal">) */
  .app-modal-enter-active,
  .app-modal-leave-active {
    transition: opacity var(--dur-base) var(--ease-default);
  }
  .app-modal-enter-active .app-modal__sheet,
  .app-modal-leave-active .app-modal__sheet {
    transition:
      transform var(--dur-slow) var(--ease-out),
      opacity var(--dur-base) var(--ease-default);
  }
  .app-modal-enter-from,
  .app-modal-leave-to {
    opacity: 0;
  }
  .app-modal-enter-from .app-modal__sheet,
  .app-modal-leave-to .app-modal__sheet {
    opacity: 0;
    transform: translateY(var(--space-4)) scale(0.98);
  }

  /* one calm fade-up of the bar on load (DESIGN.md flourish) */
  .app-add-bar {
    animation: app-rise var(--dur-slow) var(--ease-out) both;
  }

  @keyframes app-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes app-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  @keyframes app-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
  @keyframes app-rise {
    from {
      opacity: 0;
      transform: translateY(var(--space-2));
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .app-spinner {
      animation-duration: 1.4s;
    }
    .app-skeleton {
      animation-duration: 2.6s;
    }
    .app-status-badge__dot {
      animation: none;
    }
    .app-add-bar,
    .app-item-card--fresh {
      animation: none;
    }
    .app-button:active:not(:disabled) {
      transform: none;
    }
    .app-modal-enter-active .app-modal__sheet,
    .app-modal-leave-active .app-modal__sheet {
      transition: opacity var(--dur-base) var(--ease-default);
    }
    .app-modal-enter-from .app-modal__sheet,
    .app-modal-leave-to .app-modal__sheet {
      transform: none;
    }
  }
</style>
