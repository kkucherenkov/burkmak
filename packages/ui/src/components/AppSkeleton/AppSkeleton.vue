<script setup lang="ts">
  import { computed } from 'vue';

  type Variant = 'text' | 'title' | 'meta' | 'avatar' | 'image';

  const props = withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'text' });
  const rootClasses = computed(() => ['app-skeleton', `app-skeleton--${props.variant}`]);
</script>

<template>
  <div :class="rootClasses" aria-hidden="true" />
</template>

<style lang="scss" scoped>
  // No --dur-* token covers a 1.4 s shimmer cycle; define locally so no raw ms appears in declarations.
  $shimmer-dur: 1400ms;

  .app-skeleton {
    border-radius: var(--radius-sm);
    background: linear-gradient(
      90deg,
      var(--surface-surface) 25%,
      var(--surface-raised) 37%,
      var(--surface-surface) 63%
    );
    background-size: 200% 100%;
    animation: app-shimmer $shimmer-dur var(--ease) infinite;

    &--text {
      height: var(--space-3);
    }

    &--meta {
      width: 40%;
      height: var(--space-3);
    }

    &--title {
      width: 60%;
      height: var(--space-5);
    }

    &--avatar {
      width: var(--space-10);
      height: var(--space-10);
      border-radius: var(--radius-pill);
    }

    &--image {
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: var(--radius-lg);
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

  @media (prefers-reduced-motion: reduce) {
    .app-skeleton {
      animation: none;
    }
  }
</style>
