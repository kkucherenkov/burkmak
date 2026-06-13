<script setup lang="ts">
  import AppIcon from '../AppIcon/AppIcon.vue';

  withDefaults(defineProps<{ icon?: string; title: string; description?: string }>(), {
    icon: 'i-lucide-inbox',
    description: undefined,
  });
</script>

<template>
  <div
    class="app-empty-state"
    role="status"
  >
    <AppIcon
      class="app-empty-state__icon"
      :name="icon"
      size="xl"
    />
    <p class="app-empty-state__title">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="app-empty-state__desc"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots['default']"
      class="app-empty-state__action"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .app-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-12) var(--space-6);
    text-align: center;

    &__icon {
      color: var(--text-tertiary);
    }

    &__title {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
    }

    &__desc {
      font-family: var(--font-reading);
      color: var(--text-secondary);
      max-width: 32ch;
    }

    &__action {
      margin-top: var(--space-2);
    }
  }
</style>
