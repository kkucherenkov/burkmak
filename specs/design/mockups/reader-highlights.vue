<script setup lang="ts">
  /**
   * burkmak — Reader + Highlights & Notes (S2).
   *
   * Visual source of truth for the S2-ui highlight composites. Self-contained:
   * no imports beyond Vue, no real components — it stands alone like the other
   * mockups (item-detail.vue, library.vue). Styles ONLY through the canonical
   * token contract (tokens.generated.css) — --brand-accent, --surface-page,
   * --text-fg, --radius-*, --space-*, --dur-*, … This file defines NO token
   * values; the host app supplies them and the `theme` prop sets data-theme so
   * the right light/dark set cascades in.
   *
   * One reader scene composes the three new S2 pieces (matching how
   * item-detail.vue composes the reader column + fetch machine):
   *   app-article-reader   → AppArticleReader   (Literata body + highlight marks)
   *   app-highlight-popover → AppHighlightPopover (selection color picker)
   *   app-highlights-panel  → AppHighlightCard    (side panel of saved highlights)
   *   app-highlight-card (editing) → AppHighlightCard (inline note editor)
   *
   * Highlight swatch colors are CONTENT colors (the user's marks on the page),
   * not chrome — so raw warm-tuned hexes are acceptable here. Role → hex map:
   *   swatch fill (mark on paper, light): yellow #FCEFA6 · green #CDEBC5
   *     · blue #C9E2F2 · pink #F6D2DE
   *   card leading-rail (deeper, more-saturated variant of the swatch — kept as
   *     a sibling content hex because color-mix toward --text-fg only mutes the
   *     pale swatch, it cannot raise chroma to this vivid tone):
   *     yellow #E8CF4E · green #84C178 · blue #6AABD6 · pink #E08AA6
   * TODO(S2-ui): if these marks are reused across components, promote them to
   *   --highlight-{yellow,green,blue,pink} tokens (one per theme). Not blocking
   *   for the mockup — kept inline so the mark styling is visible in isolation.
   *
   * Sole px literals (matching item-detail.vue's policy): 1px hairline borders,
   * 3px focus-ring spreads, and the 6px/3px dot + meta separator — the contract
   * has no border-width / hairline / dot-size token.
   */
  import { ref } from 'vue';

  type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

  const props = withDefaults(
    defineProps<{
      theme?: 'light' | 'dark';
    }>(),
    {
      theme: 'light',
    },
  );

  /* The article being read — real, specific content (shared voice with
   * item-detail.vue's saved item). */
  const item = {
    title: 'The case for reading slowly in a world built for skimming',
    site: 'newyorker.com',
    readingTime: '12 min read',
  };

  /* Swatches offered in the selection popover. */
  const SWATCHES: Array<{ color: HighlightColor; label: string }> = [
    { color: 'yellow', label: 'Yellow' },
    { color: 'green', label: 'Green' },
    { color: 'blue', label: 'Blue' },
    { color: 'pink', label: 'Pink' },
  ];

  type Highlight = {
    id: string;
    color: HighlightColor;
    quote: string;
    note: string | null;
    savedAt: string;
  };

  /* Demo highlights backing the side panel — mockup-only state, no real logic. */
  const highlights = ref<Highlight[]>([
    {
      id: 'h1',
      color: 'yellow',
      quote:
        'a feed asks for everything, all at once, and rewards the part of us that keeps moving on',
      note: 'This is the whole problem in one sentence — the surface, not the reader.',
      savedAt: '2 min ago',
    },
    {
      id: 'h2',
      color: 'green',
      quote: 'The fix is not willpower. It is friction, reintroduced on purpose.',
      note: null,
      savedAt: '5 min ago',
    },
    {
      id: 'h3',
      color: 'blue',
      quote: 'a warm and patient typeface, no counter ticking down the unread',
      note: 'Design brief for the reader view, basically.',
      savedAt: '8 min ago',
    },
  ]);

  /* Which popover swatch is the active selection (demo only). */
  const pickedColor = ref<HighlightColor>('yellow');
  /* Which card is expanded into the inline note editor. */
  const editingId = ref<string | null>('h2');
  /* Draft text for the open editor. */
  const draftNote = ref('A reading app is a friction machine, pointed the right way.');

  function pickColor(color: HighlightColor) {
    pickedColor.value = color;
  }
  function startEditing(id: string) {
    const hit = highlights.value.find((h) => h.id === id);
    draftNote.value = hit?.note ?? '';
    editingId.value = id;
  }
  function cancelEditing() {
    editingId.value = null;
  }
  function saveNote(id: string) {
    const hit = highlights.value.find((h) => h.id === id);
    if (hit) hit.note = draftNote.value.trim() || null;
    editingId.value = null;
  }
  function removeHighlight(id: string) {
    highlights.value = highlights.value.filter((h) => h.id !== id);
  }
</script>

<template>
  <div class="app-reading" :data-theme="theme">
    <div class="app-reading__grid">
      <!-- ============================================================ -->
      <!-- @app/ui: AppArticleReader -->
      <!-- ============================================================ -->
      <main class="app-article-reader" aria-label="Article reader">
        <header class="app-article-reader__head">
          <h1 class="app-article-reader__title">{{ item.title }}</h1>
          <div class="app-article-reader__meta">
            <span class="app-article-reader__site">{{ item.site }}</span>
            <span class="app-article-reader__dot" aria-hidden="true" />
            <span>{{ item.readingTime }}</span>
          </div>
        </header>

        <div class="app-article-reader__body">
          <p>
            There is a particular tiredness that comes from a day of reading without remembering any
            of it. You scroll, you skim, you save — and by evening the saved things have become
            their own quiet source of guilt, a pile you keep meaning to get to.
          </p>

          <p>
            What changed is not our capacity for attention but the shape of the surfaces we read on.
            A printed page asks for nothing;
            <!-- inline highlight mark (yellow) -->
            <mark class="app-highlight app-highlight--yellow"
              >a feed asks for everything, all at once, and rewards the part of us that keeps moving
              on</mark
            >
            to the next thing. The friction that used to hold us on a page has been engineered away,
            and with it the habit of staying.

            <!-- selection-in-progress: this run shows the popover anchored above it -->
            <span class="app-selection">
              <span class="app-selection__run"
                >A handful of deliberate choices can coax our attention back.</span
              >

              <!-- ====================================================== -->
              <!-- @app/ui: AppHighlightPopover -->
              <!-- ====================================================== -->
              <span
                class="app-highlight-popover"
                role="dialog"
                aria-label="Highlight this selection"
              >
                <span class="app-highlight-popover__swatches">
                  <button
                    v-for="sw in SWATCHES"
                    :key="sw.color"
                    type="button"
                    class="app-highlight-popover__swatch"
                    :class="[
                      `app-highlight-popover__swatch--${sw.color}`,
                      { 'is-picked': pickedColor === sw.color },
                    ]"
                    :aria-label="`Highlight ${sw.label}`"
                    :aria-pressed="pickedColor === sw.color"
                    @click="pickColor(sw.color)"
                  />
                </span>
                <span class="app-highlight-popover__sep" aria-hidden="true" />
                <button type="button" class="app-highlight-popover__note">
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-5 4z"
                    />
                    <path d="M8 9h8" />
                    <path d="M8 12h5" />
                  </svg>
                  Add note
                </button>
                <span class="app-highlight-popover__caret" aria-hidden="true" />
              </span>
            </span>
          </p>

          <p>
            The fix is not willpower.
            <!-- inline highlight mark (green) -->
            <mark class="app-highlight app-highlight--green"
              >It is friction, reintroduced on purpose</mark
            >: a single column, a warm and patient typeface, no counter ticking down the unread, and
            a way to set a thing aside without losing it. The page stops competing for the next tap
            and starts, again, to simply hold the words.
          </p>
        </div>
      </main>

      <!-- ============================================================ -->
      <!-- @app/ui: AppHighlightCard (side panel of saved highlights) -->
      <!-- ============================================================ -->
      <aside class="app-highlights-panel" aria-label="Highlights and notes">
        <header class="app-highlights-panel__head">
          <h2 class="app-highlights-panel__title">Highlights</h2>
          <span class="app-highlights-panel__count">{{ highlights.length }}</span>
        </header>

        <ul class="app-highlights-panel__list">
          <li
            v-for="h in highlights"
            :key="h.id"
            class="app-highlight-card"
            :class="`app-highlight-card--${h.color}`"
          >
            <blockquote class="app-highlight-card__quote">{{ h.quote }}</blockquote>

            <!-- ================================================== -->
            <!-- @app/ui: AppHighlightCard (editing) -->
            <!-- inline expanded note editor for the open card -->
            <!-- ================================================== -->
            <form
              v-if="editingId === h.id"
              class="app-highlight-card__editor"
              @submit.prevent="saveNote(h.id)"
            >
              <textarea
                v-model="draftNote"
                class="app-highlight-card__textarea"
                rows="3"
                placeholder="Add a note…"
                aria-label="Note for this highlight"
              />
              <div class="app-highlight-card__editor-actions">
                <button
                  type="button"
                  class="app-button app-button--ghost app-button--sm"
                  @click="cancelEditing"
                >
                  Cancel
                </button>
                <button type="submit" class="app-button app-button--primary app-button--sm">
                  Save note
                </button>
              </div>
            </form>

            <!-- resting state: note (if any) + footer actions -->
            <template v-else>
              <p v-if="h.note" class="app-highlight-card__note">{{ h.note }}</p>

              <footer class="app-highlight-card__foot">
                <time class="app-highlight-card__time">{{ h.savedAt }}</time>
                <span class="app-highlights-panel__spacer" />
                <button
                  type="button"
                  class="app-icon-btn"
                  :aria-label="h.note ? 'Edit note' : 'Add note'"
                  @click="startEditing(h.id)"
                >
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
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="app-icon-btn"
                  aria-label="Delete highlight"
                  @click="removeHighlight(h.id)"
                >
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
                    <path d="M4 7h16" />
                    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
                  </svg>
                </button>
              </footer>
            </template>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
  /* Tokens come from the global contract (tokens.generated.css). This component
 * defines none — it only consumes canonical vars. The few px literals are
 * 1px hairline borders, 3px focus-ring spreads, and 6px/3px dots/separators
 * (the contract has no border-width / hairline / dot-size token).
 *
 * Highlight hexes are CONTENT colors (the user's marks), warm-tuned to sit on
 * the paper surface. Role → hex (light):
 *   swatch fill: yellow #FCEFA6 · green #CDEBC5 · blue #C9E2F2 · pink #F6D2DE
 *   card leading-rail (deeper, more-saturated variant of the matching swatch;
 *   not color-mix-derived — mixing the pale swatch toward --text-fg only mutes
 *   it and cannot reach this chroma): yellow #E8CF4E · green #84C178
 *   · blue #6AABD6 · pink #E08AA6
 * See the script header TODO about promoting these to --highlight-* tokens for
 * S2-ui. */

  .app-reading {
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
  }

  /* reader column (~44rem measure) + highlights panel beside it; panel collapses
   * below the reader on narrow widths (see media query at the bottom). */
  .app-reading__grid {
    width: min(100%, 72rem);
    margin-inline: auto;
    display: grid;
    grid-template-columns: minmax(0, 44rem) minmax(16rem, 22rem);
    gap: clamp(var(--space-6), 4vw, var(--space-12));
    align-items: start;
  }

  /* gentle staggered fade-up on load (one calm motion, per DESIGN.md) */
  .app-reading__grid > * {
    animation: app-rise var(--dur-slow) var(--ease-out) both;
  }
  .app-reading__grid > *:nth-child(2) {
    animation-delay: var(--dur-fast);
  }

  /* ----------------------------------------------------- AppArticleReader */
  .app-article-reader {
    display: grid;
    gap: var(--space-6);
    min-width: 0;

    &__head {
      display: grid;
      gap: var(--space-3);
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
      text-wrap: balance;
    }

    &__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    &__site {
      font-weight: var(--fw-medium);
    }

    &__dot {
      width: 3px;
      height: 3px;
      border-radius: var(--radius-pill);
      background: currentColor;
      opacity: 0.55;
    }

    /* Literata reader body — generous leading, warm ink */
    &__body {
      font-family: var(--font-reading);
      font-size: var(--text-lg);
      line-height: var(--leading-relaxed);
      color: var(--text-fg);
      max-width: 44rem;

      p {
        margin: 0;
      }

      p + p {
        margin-top: var(--space-5);
      }
    }
  }

  /* highlight marks — soft content-color fills behind the running text.
   * box-decoration-break keeps the rounding clean across line wraps. */
  .app-highlight {
    color: inherit;
    background: transparent;
    border-radius: var(--radius-sm);
    padding-block: 0.06em;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;

    &--yellow {
      background: #fcefa6;
    }
    &--green {
      background: #cdebc5;
    }
    &--blue {
      background: #c9e2f2;
    }
    &--pink {
      background: #f6d2de;
    }
  }

  /* ----------------------------------------------------- AppHighlightPopover */
  /* the run of text the popover is anchored to (selection-in-progress) */
  .app-selection {
    position: relative;

    &__run {
      border-radius: var(--radius-sm);
      background: color-mix(in oklab, var(--brand-accent) 22%, transparent);
      padding-block: 0.06em;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }
  }

  .app-highlight-popover {
    position: absolute;
    inset-block-end: calc(100% + var(--space-3));
    inset-inline-start: 50%;
    transform: translateX(-50%);
    z-index: var(--z-overlay);
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    font-family: var(--font-sans);
    white-space: nowrap;
    background: var(--surface-overlay);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);

    &__swatches {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
    }

    &__swatch {
      width: var(--space-6);
      height: var(--space-6);
      padding: 0;
      border: 1px solid color-mix(in oklab, var(--text-fg) 12%, transparent);
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition:
        transform var(--dur-fast) var(--ease-default),
        box-shadow var(--dur-fast) var(--ease-default);

      &:hover {
        transform: scale(1.1);
      }

      &.is-picked {
        box-shadow:
          0 0 0 2px var(--surface-overlay),
          0 0 0 4px var(--brand-accent);
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 40%, transparent);
      }

      &--yellow {
        background: #fcefa6;
      }
      &--green {
        background: #cdebc5;
      }
      &--blue {
        background: #c9e2f2;
      }
      &--pink {
        background: #f6d2de;
      }
    }

    &__sep {
      width: 1px;
      align-self: stretch;
      margin-block: var(--space-1);
      background: var(--border-default);
    }

    &__note {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-3) var(--space-1) var(--space-2);
      font: inherit;
      font-size: var(--text-sm);
      font-weight: var(--fw-semibold);
      color: var(--text-secondary);
      background: transparent;
      border: 0;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition:
        color var(--dur-fast) var(--ease-default),
        background var(--dur-fast) var(--ease-default);

      &:hover {
        color: var(--brand-accent);
        background: var(--brand-accent-subtle);
      }

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
      }
    }

    /* little downward caret pointing at the selected run */
    &__caret {
      position: absolute;
      inset-block-start: 100%;
      inset-inline-start: 50%;
      width: var(--space-3);
      height: var(--space-2);
      transform: translateX(-50%);
      background: var(--surface-overlay);
      border-inline: 1px solid var(--border-default);
      border-block-end: 1px solid var(--border-default);
      clip-path: polygon(0 0, 100% 0, 50% 100%);
    }
  }

  /* ----------------------------------------------------- highlights panel */
  .app-highlights-panel {
    position: sticky;
    top: var(--space-6);
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-sm);

    &__head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-xl);
      line-height: var(--leading-snug);
      color: var(--text-fg);
    }

    &__count {
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

    &__list {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    &__spacer {
      flex: 1 1 var(--space-2);
    }
  }

  /* ----------------------------------------------------- AppHighlightCard */
  .app-highlight-card {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface-page);
    border: 1px solid var(--border-default);
    /* color rail on the leading edge — keyed to the highlight color */
    border-inline-start: var(--space-1) solid var(--border-strong);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--dur-base) var(--ease-default);

    &:hover {
      box-shadow: var(--shadow-md);
    }

    /* leading-rail = deeper, more-saturated variant of the matching swatch;
       documented in the style header role→hex map (not color-mix-derived —
       see note there). */
    &--yellow {
      border-inline-start-color: #e8cf4e;
    }
    &--green {
      border-inline-start-color: #84c178;
    }
    &--blue {
      border-inline-start-color: #6aabd6;
    }
    &--pink {
      border-inline-start-color: #e08aa6;
    }

    &__quote {
      margin: 0;
      font-family: var(--font-reading);
      font-size: var(--text-md);
      line-height: var(--leading-relaxed);
      color: var(--text-fg);
    }

    &__note {
      margin: 0;
      padding-top: var(--space-3);
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
      color: var(--text-secondary);
      border-top: 1px solid var(--border-default);
    }

    &__foot {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    &__time {
      font-size: var(--text-xs);
      font-weight: var(--fw-medium);
      letter-spacing: var(--tracking-wide);
      color: var(--text-tertiary);
    }

    /* inline note editor (expanded state) */
    &__editor {
      display: grid;
      gap: var(--space-3);
    }

    &__textarea {
      width: 100%;
      padding: var(--space-3);
      font: inherit;
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
      color: var(--text-fg);
      background: var(--surface-raised);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      resize: vertical;
      transition:
        border-color var(--dur-base) var(--ease-default),
        box-shadow var(--dur-base) var(--ease-default);

      &::placeholder {
        color: var(--text-tertiary);
      }

      &:focus-visible {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
      }
    }

    &__editor-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }
  }

  /* small ghost icon button (edit / delete), shared shape with item-detail.vue */
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

    &:last-child:hover {
      color: var(--status-error-fg);
      background: var(--status-error-subtle);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }

  /* -------------------------------------------------------------- AppButton */
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
      background var(--dur-base) var(--ease-default),
      color var(--dur-base) var(--ease-default),
      border-color var(--dur-base) var(--ease-default);

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }

    &--sm {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-sm);
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

  /* narrow: panel drops below the reader column */
  @media (max-width: 56rem) {
    .app-reading__grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .app-highlights-panel {
      position: static;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .app-reading__grid > * {
      animation: none;
    }
    .app-highlight-popover__swatch {
      transition: none;
    }
  }
</style>
