<script setup lang="ts">
  /**
   * burkmak — Item Detail (a single saved article).
   *
   * Near drop-in reference for `@app/ui`. Self-contained: no imports beyond Vue.
   * Styles ONLY through the canonical token contract (tokens.preview.css) —
   * --brand-accent, --surface-page, --text-fg, --radius-*, --space-*, --dur-*, …
   * The component defines NO token values; the host app supplies them and the
   * `theme` prop sets data-theme so the right light/dark set cascades in.
   *
   * Markup stands in for these primitives (extract by root class + comment):
   *   app-tag-chip · app-status-badge · app-button · app-segment
   *   app-reader-preview (AppReaderToolbar family) · app-lead (figure)
   *
   * Sole px literals (matching library.vue's policy): 1px hairline borders,
   * 3px focus-ring spreads, and the 6px/3px status dot + meta separator — the
   * contract has no border-width / hairline / dot-size token.
   */
  import { computed, ref } from 'vue';

  type FetchStatus = 'idle' | 'pending' | 'extracting' | 'ready' | 'failed';
  type ReadState = 'unread' | 'read' | 'archived';

  const props = withDefaults(
    defineProps<{
      theme?: 'light' | 'dark';
      initialStatus?: FetchStatus;
      initialReadState?: ReadState;
      initialFavorite?: boolean;
    }>(),
    {
      theme: 'light',
      initialStatus: 'idle',
      initialReadState: 'unread',
      initialFavorite: false,
    },
  );

  /* The one saved article this screen is about. Real, specific content. */
  const item = {
    title: 'The case for reading slowly in a world built for skimming',
    site: 'newyorker.com',
    url: 'https://www.newyorker.com/culture/annals-of-inquiry/the-case-for-reading-slowly',
    savedAt: 'Saved 3 hours ago',
    readingTime: '12 min read',
    excerpt:
      'Infinite feeds rewired how we move through text — fast, shallow, restless. A handful of deliberate design choices can coax our attention back into the long, patient gear that books once asked of us.',
  };

  const previewParas = [
    'There is a particular tiredness that comes from a day of reading without remembering any of it. You scroll, you skim, you save — and by evening the saved things have become their own quiet source of guilt, a pile you keep meaning to get to.',
    'What changed is not our capacity for attention but the shape of the surfaces we read on. A printed page asks for nothing; a feed asks for everything, all at once, and rewards the part of us that keeps moving on to the next thing.',
    'The fix is not willpower. It is friction, reintroduced on purpose: a single column, a warm and patient typeface, no counter ticking down the unread, and a way to set a thing aside without losing it.',
  ];

  const FAIL_REASON =
    'We couldn’t reach newyorker.com — the request timed out. The page may be behind a paywall or temporarily offline.';

  const READ_SEGMENTS: Array<{ key: ReadState; label: string }> = [
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' },
    { key: 'archived', label: 'Archived' },
  ];

  const status = ref<FetchStatus>(props.initialStatus);
  const readState = ref<ReadState>(props.initialReadState);
  const favorite = ref(props.initialFavorite);
  const tags = ref<string[]>(['reading', 'attention', 'longread']);
  const draftTag = ref('');

  const initial = computed(() => item.site.charAt(0).toUpperCase());
  const isWorking = computed(() => status.value === 'pending' || status.value === 'extracting');

  let pendingTimer = 0;
  let extractTimer = 0;

  /* Realistic state machine: idle/failed → pending → extracting → ready.
   * Timers are cleared on unmount-equivalent reuse so a re-fetch never races. */
  function fetchArticle() {
    window.clearTimeout(pendingTimer);
    window.clearTimeout(extractTimer);
    status.value = 'pending';
    pendingTimer = window.setTimeout(() => {
      status.value = 'extracting';
      extractTimer = window.setTimeout(() => {
        status.value = 'ready';
      }, 1400);
    }, 900);
  }

  function setReadState(next: ReadState) {
    readState.value = next;
  }
  function toggleFavorite() {
    favorite.value = !favorite.value;
  }
  function removeTag(tag: string) {
    tags.value = tags.value.filter((t) => t !== tag);
  }
  function addTag() {
    const next = draftTag.value.trim().replace(/^#/, '').toLowerCase();
    if (!next || tags.value.includes(next)) {
      draftTag.value = '';
      return;
    }
    tags.value = [...tags.value, next];
    draftTag.value = '';
  }
  function read() {
    /* Affordance only in this reference — the host app routes to the reader. */
    readState.value = 'read';
  }
</script>

<template>
  <article class="app-detail" :data-theme="theme">
    <div class="app-detail__inner">
      <!-- @app/ui: AppButton (back / overflow) -->
      <header class="app-detail__topbar">
        <button type="button" class="app-link-btn" aria-label="Back to library">
          <svg
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
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <span>Library</span>
        </button>

        <span class="app-detail__spacer" />

        <button type="button" class="app-icon-btn" aria-label="Archive">
          <svg
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
            <path d="M3 4h18v4H3z" />
            <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
            <path d="M10 12h4" />
          </svg>
        </button>
        <button type="button" class="app-icon-btn" aria-label="Delete">
          <svg
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
            <path d="M4 7h16" />
            <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
          </svg>
        </button>
      </header>

      <!-- header: title, then site + saved-time meta -->
      <div class="app-detail__head">
        <h1 class="app-detail__title">{{ item.title }}</h1>

        <div class="app-detail__meta">
          <span class="app-detail__favicon" aria-hidden="true">{{ initial }}</span>
          <a class="app-detail__site" :href="item.url" rel="noreferrer">{{ item.site }}</a>
          <span class="app-detail__dot" aria-hidden="true" />
          <span>{{ item.savedAt }}</span>
          <span class="app-detail__dot" aria-hidden="true" />
          <span class="app-detail__reading">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
            {{ item.readingTime }}
          </span>
        </div>
      </div>

      <!-- lead image (mockup placeholder figure) -->
      <figure class="app-lead">
        <div
          class="app-lead__media"
          role="img"
          :aria-label="`Lead illustration for “${item.title}”`"
        />
        <figcaption class="app-lead__caption">Lead image · {{ item.site }}</figcaption>
      </figure>

      <!-- excerpt / dek (Literata) -->
      <p class="app-detail__excerpt">{{ item.excerpt }}</p>

      <!-- @app/ui: AppTagChip (removable) + add -->
      <div class="app-detail__tags">
        <span v-for="tag in tags" :key="tag" class="app-tag-chip app-tag-chip--removable">
          <span class="app-tag-chip__hash" aria-hidden="true">#</span>{{ tag }}
          <button
            type="button"
            class="app-tag-chip__remove"
            :aria-label="`Remove tag ${tag}`"
            @click="removeTag(tag)"
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6l-12 12" />
            </svg>
          </button>
        </span>

        <form class="app-tag-add" @submit.prevent="addTag">
          <input
            v-model="draftTag"
            class="app-tag-add__input"
            type="text"
            placeholder="Add tag"
            aria-label="Add a tag"
            maxlength="24"
          />
          <button
            type="submit"
            class="app-tag-add__btn"
            :disabled="!draftTag.trim()"
            aria-label="Add tag"
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </form>
      </div>

      <!-- read-state controls + favorite toggle -->
      <div class="app-detail__controls">
        <!-- @app/ui: AppSegment (read state) -->
        <div class="app-segment" role="group" aria-label="Read state">
          <button
            v-for="seg in READ_SEGMENTS"
            :key="seg.key"
            type="button"
            class="app-segment__btn"
            :aria-pressed="readState === seg.key"
            @click="setReadState(seg.key)"
          >
            {{ seg.label }}
          </button>
        </div>

        <span class="app-detail__spacer" />

        <!-- @app/ui: AppButton (toggle) -->
        <button
          type="button"
          class="app-fav"
          :class="{ 'app-fav--on': favorite }"
          :aria-pressed="favorite"
          @click="toggleFavorite"
        >
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L4.5 9.7l5.9-.8z" />
          </svg>
          <span>{{ favorite ? 'Favorited' : 'Favorite' }}</span>
        </button>
      </div>

      <!-- @app/ui: fetch / reader (AppReaderToolbar family) -->
      <section class="app-fetch" :class="`app-fetch--${status}`" aria-live="polite">
        <!-- idle -->
        <div v-if="status === 'idle'" class="app-fetch__pitch">
          <div class="app-fetch__copy">
            <h2 class="app-fetch__title">Read it here, clean</h2>
            <p class="app-fetch__hint">
              Fetch a distraction-free reader view — no ads, no pop-ups — and keep it offline.
            </p>
          </div>
          <button
            type="button"
            class="app-button app-button--primary app-fetch__cta"
            @click="fetchArticle"
          >
            <svg
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
              <path d="M12 4v11" />
              <path d="M7.5 10.5L12 15l4.5-4.5" />
              <path d="M5 19h14" />
            </svg>
            Fetch full article
          </button>
        </div>

        <!-- pending / extracting share the working layout -->
        <div v-else-if="isWorking" class="app-fetch__working" role="status">
          <div class="app-fetch__working-head">
            <span
              class="app-status-badge"
              :class="
                status === 'pending' ? 'app-status-badge--pending' : 'app-status-badge--extracting'
              "
            >
              <span class="app-status-badge__dot" aria-hidden="true" />
              {{ status === 'pending' ? 'Queued' : 'Extracting' }}
            </span>
            <span class="app-fetch__working-label">
              {{ status === 'pending' ? 'Saving the page…' : 'Pulling out the readable text…' }}
            </span>
          </div>
          <div class="app-fetch__bar" aria-hidden="true">
            <span class="app-fetch__bar-fill" />
          </div>
          <p class="app-fetch__hint">
            {{
              status === 'pending'
                ? 'Your copy is in the queue. This usually takes a few seconds.'
                : 'Stripping navigation, ads, and clutter — keeping the words and the images.'
            }}
          </p>
        </div>

        <!-- ready: reader preview + Read affordance -->
        <div v-else-if="status === 'ready'" class="app-fetch__ready">
          <div class="app-fetch__ready-head">
            <span class="app-status-badge app-status-badge--ready">
              <span class="app-status-badge__dot" aria-hidden="true" />
              Ready
            </span>
            <span class="app-fetch__ready-meta">{{ item.readingTime }} · saved offline</span>
          </div>

          <!-- @app/ui: AppReaderPreview -->
          <div class="app-reader-preview">
            <div class="app-reader-preview__body">
              <p v-for="(para, i) in previewParas" :key="i" class="app-reader-preview__para">
                {{ para }}
              </p>
            </div>
            <span class="app-reader-preview__fade" aria-hidden="true" />
          </div>

          <div class="app-reader-preview__actions">
            <button type="button" class="app-button app-button--primary" @click="read">
              <svg
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
                <path d="M4 5.5A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 1.5z" />
                <path d="M20 5.5A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 1.5z" />
              </svg>
              Read
            </button>
            <a class="app-button app-button--ghost" :href="item.url" rel="noreferrer">
              Open original
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M14 5h5v5" />
                <path d="M19 5l-8 8" />
                <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
              </svg>
            </a>
          </div>
        </div>

        <!-- failed -->
        <div v-else class="app-fetch__failed">
          <div class="app-fetch__failed-row">
            <span class="app-fetch__failed-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7.5v5" />
                <path d="M12 16h.01" />
              </svg>
            </span>
            <div>
              <h2 class="app-fetch__title">We couldn’t fetch this article</h2>
              <p class="app-fetch__hint">{{ FAIL_REASON }}</p>
            </div>
          </div>
          <div class="app-fetch__failed-actions">
            <button type="button" class="app-button app-button--primary" @click="fetchArticle">
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 11a8 8 0 1 0-.6 4" />
                <path d="M20 5v6h-6" />
              </svg>
              Try again
            </button>
            <a class="app-button app-button--ghost" :href="item.url" rel="noreferrer"
              >Open original</a
            >
          </div>
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped lang="scss">
  /* Tokens come from the global contract (tokens.preview.css). This component
 * defines none — it only consumes canonical vars. The few px literals are
 * 1px hairline borders, 3px focus-ring spreads, and 6px/3px dots/separators
 * (the contract has no border-width / hairline / dot-size token). */

  .app-detail {
    min-height: 100dvh;
    padding: clamp(var(--space-5), 5vw, var(--space-16)) clamp(var(--space-4), 5vw, var(--space-8));
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
      width: min(100%, 44rem);
      margin-inline: auto;
      display: grid;
      gap: var(--space-5);
    }

    &__spacer {
      flex: 1 1 var(--space-2);
    }
  }

  /* gentle staggered fade-up on load (one calm motion, per DESIGN.md) */
  .app-detail__inner > * {
    animation: app-rise var(--dur-slow) var(--ease-decelerate) both;
  }
  .app-detail__inner > *:nth-child(1) {
    animation-delay: 0ms;
  }
  .app-detail__inner > *:nth-child(2) {
    animation-delay: var(--dur-fast);
  }
  .app-detail__inner > *:nth-child(3) {
    animation-delay: var(--dur-base);
  }
  .app-detail__inner > *:nth-child(4) {
    animation-delay: calc(var(--dur-base) + var(--dur-fast));
  }
  .app-detail__inner > *:nth-child(5) {
    animation-delay: var(--dur-slow);
  }
  .app-detail__inner > *:nth-child(6) {
    animation-delay: calc(var(--dur-slow) + var(--dur-fast));
  }
  .app-detail__inner > *:nth-child(7) {
    animation-delay: calc(var(--dur-slow) + var(--dur-base));
  }

  /* ------------------------------------------------------------- topbar */
  .app-detail__topbar {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .app-link-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3) var(--space-2) var(--space-2);
    margin-inline-start: calc(-1 * var(--space-2));
    font: inherit;
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-secondary);
    background: transparent;
    border: 0;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      color var(--dur-base) var(--ease-standard),
      background var(--dur-base) var(--ease-standard);

    &:hover {
      color: var(--text-fg);
      background: var(--surface-surface);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }

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
      color var(--dur-fast) var(--ease-standard),
      background var(--dur-fast) var(--ease-standard);

    &:hover {
      color: var(--text-fg);
      background: var(--surface-surface);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }

  /* --------------------------------------------------------------- head */
  .app-detail__head {
    display: grid;
    gap: var(--space-3);
  }

  .app-detail__title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--fw-semibold);
    font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-tight);
    text-wrap: balance;
  }

  .app-detail__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .app-detail__favicon {
    display: grid;
    place-items: center;
    width: var(--space-6);
    height: var(--space-6);
    font-family: var(--font-display);
    font-weight: var(--fw-semibold);
    font-size: var(--text-xs);
    color: var(--brand-accent);
    background: var(--surface-surface);
    border-radius: var(--radius-sm);
  }

  .app-detail__site {
    color: var(--text-secondary);
    font-weight: var(--fw-medium);
    text-decoration: none;

    &:hover {
      color: var(--text-link);
      text-decoration: underline;
    }

    &:focus-visible {
      outline: none;
      color: var(--text-link);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
      border-radius: var(--radius-xs);
    }
  }

  .app-detail__dot {
    width: 3px;
    height: 3px;
    border-radius: var(--radius-pill);
    background: currentColor;
    opacity: 0.55;
  }

  .app-detail__reading {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  /* ----------------------------------------------------------- lead image */
  .app-lead {
    margin: 0;
    display: grid;
    gap: var(--space-2);

    &__media {
      aspect-ratio: 16 / 9;
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border-default);
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(
          120% 130% at 16% 10%,
          color-mix(in oklab, var(--brand-accent) 30%, transparent),
          transparent 55%
        ),
        radial-gradient(
          120% 130% at 86% 92%,
          color-mix(in oklab, var(--brand-accent) 16%, transparent),
          transparent 60%
        ),
        linear-gradient(140deg, var(--surface-surface), var(--brand-accent-subtle));

      /* faint ruled-paper texture — the reading-room motif */
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
          var(--text-fg) 0 1px,
          transparent 1px var(--space-5)
        );
        opacity: 0.05;
        mix-blend-mode: multiply;
      }
    }

    &__caption {
      font-size: var(--text-xs);
      font-weight: var(--fw-medium);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
  }

  /* ------------------------------------------------------------- excerpt */
  .app-detail__excerpt {
    margin: 0;
    font-family: var(--font-reading);
    font-size: var(--text-xl);
    line-height: var(--leading-relaxed);
    color: var(--text-secondary);
    max-width: 60ch;
    text-wrap: pretty;
  }

  /* ---------------------------------------------------------------- tags */
  .app-detail__tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  /* AppTagChip — pill radius reserved for chips per DESIGN.md */
  .app-tag-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--fw-medium);
    color: var(--text-secondary);
    background: var(--surface-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);

    &__hash {
      color: var(--text-tertiary);
    }

    &--removable {
      padding-inline-end: var(--space-1);
    }

    &__remove {
      display: grid;
      place-items: center;
      width: var(--space-5);
      height: var(--space-5);
      color: var(--text-tertiary);
      background: transparent;
      border: 0;
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition:
        color var(--dur-fast) var(--ease-standard),
        background var(--dur-fast) var(--ease-standard);

      &:hover {
        color: var(--status-error-fg);
        background: var(--status-error-subtle);
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
      }
    }
  }

  .app-tag-add {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);

    &__input {
      width: 7rem;
      padding: var(--space-1) var(--space-3);
      font: inherit;
      font-size: var(--text-sm);
      color: var(--text-fg);
      background: transparent;
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-pill);
      transition:
        border-color var(--dur-base) var(--ease-standard),
        box-shadow var(--dur-base) var(--ease-standard);

      &::placeholder {
        color: var(--text-tertiary);
      }

      &:focus-visible {
        outline: none;
        border-style: solid;
        border-color: var(--border-focus);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
      }
    }

    &__btn {
      display: grid;
      place-items: center;
      width: var(--space-7);
      height: var(--space-7);
      color: var(--text-secondary);
      background: var(--surface-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition:
        color var(--dur-fast) var(--ease-standard),
        background var(--dur-fast) var(--ease-standard),
        border-color var(--dur-fast) var(--ease-standard);

      &:hover:not(:disabled) {
        color: var(--brand-accent);
        border-color: var(--border-strong);
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
      }

      &:disabled {
        color: var(--text-disabled);
        cursor: not-allowed;
      }
    }
  }

  /* ------------------------------------------------------------ controls */
  .app-detail__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .app-segment {
    display: inline-flex;
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--surface-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);

    &__btn {
      padding: var(--space-2) var(--space-3);
      font: inherit;
      font-size: var(--text-sm);
      font-weight: var(--fw-semibold);
      color: var(--text-secondary);
      background: transparent;
      border: 0;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition:
        color var(--dur-base) var(--ease-standard),
        background var(--dur-base) var(--ease-standard);

      &:hover {
        color: var(--text-fg);
      }

      &[aria-pressed='true'] {
        color: var(--text-fg);
        background: var(--surface-raised);
        box-shadow: var(--shadow-sm);
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
      }
    }
  }

  .app-fav {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-secondary);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition:
      color var(--dur-base) var(--ease-standard),
      border-color var(--dur-base) var(--ease-standard),
      background var(--dur-base) var(--ease-standard);

    &:hover {
      color: var(--text-fg);
      border-color: var(--border-strong);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }

    &--on {
      color: var(--brand-accent);
      border-color: color-mix(in oklab, var(--brand-accent) 40%, var(--border-default));
      background: var(--brand-accent-subtle);

      svg {
        fill: color-mix(in oklab, var(--brand-accent) 26%, transparent);
      }
    }
  }

  /* -------------------------------------------------------- AppButton */
  .app-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    font: inherit;
    font-size: var(--text-md);
    font-weight: var(--fw-semibold);
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition:
      background var(--dur-base) var(--ease-standard),
      color var(--dur-base) var(--ease-standard),
      border-color var(--dur-base) var(--ease-standard);

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }

    &--primary {
      color: var(--brand-accent-fg);
      background: var(--brand-accent);

      &:hover {
        background: var(--brand-accent-hover);
      }

      &:active {
        background: var(--brand-accent-active);
      }
    }

    &--ghost {
      color: var(--text-secondary);
      background: var(--surface-raised);
      border-color: var(--border-default);

      &:hover {
        color: var(--text-fg);
        border-color: var(--border-strong);
      }
    }
  }

  /* ------------------------------------------------------------- fetch */
  .app-fetch {
    padding: var(--space-5);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-sm);

    &__pitch {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
    }

    &__copy {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-xl);
      line-height: var(--leading-snug);
      color: var(--text-fg);
    }

    &__hint {
      margin: 0;
      font-size: var(--text-md);
      line-height: var(--leading-normal);
      color: var(--text-secondary);
      max-width: 46ch;
    }

    &__cta {
      flex: 0 0 auto;
    }

    /* working (pending + extracting) */
    &__working {
      display: grid;
      gap: var(--space-3);
    }

    &__working-head {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    &__working-label {
      font-size: var(--text-md);
      font-weight: var(--fw-medium);
      color: var(--text-fg);
    }

    &__bar {
      position: relative;
      height: var(--space-2);
      overflow: hidden;
      background: var(--surface-surface);
      border-radius: var(--radius-pill);
    }

    &__bar-fill {
      position: absolute;
      inset-block: 0;
      inline-size: 40%;
      border-radius: var(--radius-pill);
      background: var(--brand-accent);
      animation: app-fetch-indeterminate 1.5s var(--ease-standard) infinite;
    }

    /* ready */
    &__ready {
      display: grid;
      gap: var(--space-4);
    }

    &__ready-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }

    &__ready-meta {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
    }

    /* failed */
    &__failed {
      display: grid;
      gap: var(--space-4);
    }

    &__failed-row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    &__failed-icon {
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      width: var(--space-10);
      height: var(--space-10);
      color: var(--status-error-fg);
      background: var(--status-error-subtle);
      border-radius: var(--radius-pill);
    }

    &__failed-actions,
    &__reader-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    &--failed {
      border-color: color-mix(in oklab, var(--status-error-fg) 30%, var(--border-default));
    }
  }

  /* --------------------------------------------------- AppReaderPreview */
  .app-reader-preview {
    position: relative;
    padding: var(--space-5) var(--space-5) var(--space-6);
    background: var(--surface-page);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    max-height: 16rem;
    overflow: hidden;

    &__body {
      font-family: var(--font-reading);
      font-size: var(--text-lg);
      line-height: var(--leading-relaxed);
      color: var(--text-fg);
      max-width: 64ch;
    }

    &__para {
      margin: 0;

      & + & {
        margin-top: var(--space-4);
      }
    }

    &__fade {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      block-size: var(--space-16);
      background: linear-gradient(to bottom, transparent, var(--surface-page));
      pointer-events: none;
    }

    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
  }

  @keyframes app-rise {
    from {
      opacity: 0;
      transform: translateY(var(--space-3));
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes app-fetch-indeterminate {
    0% {
      transform: translateX(-110%) scaleX(0.6);
    }
    60% {
      transform: translateX(120%) scaleX(1);
    }
    100% {
      transform: translateX(260%) scaleX(0.6);
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

    &--ready {
      color: var(--status-success-fg);
      background: var(--status-success-subtle);
    }

    &--failed {
      color: var(--status-error-fg);
      background: var(--status-error-subtle);
    }

    &--pending &__dot,
    &--extracting &__dot {
      animation: app-pulse 1.3s var(--ease-standard) infinite;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .app-detail__inner > * {
      animation: none;
    }
    .app-fetch__bar-fill {
      animation: none;
      inline-size: 60%;
    }
    .app-status-badge__dot {
      animation: none;
    }
  }
</style>
