<script setup lang="ts">
  import type { AppHighlightColor } from '../AppArticleReader/AppArticleReader.vue';

  const props = withDefaults(
    defineProps<{
      colors?: readonly AppHighlightColor[];
      labels: { addNote: string };
    }>(),
    {
      colors: () => ['yellow', 'green', 'blue', 'pink'] as const,
    },
  );

  const emit = defineEmits<{
    pick: [color: AppHighlightColor];
    addNote: [];
  }>();
</script>

<template>
  <div class="app-highlight-popover" role="dialog" aria-label="Highlight this selection">
    <div class="app-highlight-popover__swatches">
      <button
        v-for="color in props.colors"
        :key="color"
        type="button"
        :class="['app-highlight-popover__swatch', `app-highlight-popover__swatch--${color}`]"
        :aria-label="`Highlight ${color}`"
        @click="emit('pick', color)"
      />
    </div>
    <span class="app-highlight-popover__sep" aria-hidden="true" />
    <button
      type="button"
      class="app-highlight-popover__note"
      data-testid="add-note-btn"
      @click="emit('addNote')"
    >
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
      {{ labels.addNote }}
    </button>
    <span class="app-highlight-popover__caret" aria-hidden="true" />
  </div>
</template>

<style lang="scss" scoped>
  .app-highlight-popover {
    position: relative;
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

      &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 40%, transparent);
      }

      // WHY: swatch background uses --highlight-* tokens defined in styles.css.
      // These are content-purpose colors (the user's marks), not chrome tokens.
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

    // Downward caret pointing at the selected text run.
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

  @media (prefers-reduced-motion: reduce) {
    .app-highlight-popover__swatch {
      transition: none;
    }
  }
</style>
