<script setup lang="ts">
  import AppButton from '../AppButton/AppButton.vue';
  import AppCard from '../AppCard/AppCard.vue';

  export interface AppShelfRowData {
    id: string;
    name: string;
    itemCount: number;
  }

  defineProps<{
    shelf: AppShelfRowData;
    labels: { rename: string; delete: string; itemCount: string };
  }>();

  const emit = defineEmits<{
    open: [id: string];
    rename: [id: string];
    delete: [id: string];
  }>();
</script>

<template>
  <AppCard class="app-shelf-row">
    <div class="app-shelf-row__main">
      <div class="app-shelf-row__body">
        <button type="button" class="app-shelf-row__name" @click="emit('open', shelf.id)">
          {{ shelf.name }}
        </button>
        <p class="app-shelf-row__count">
          {{ labels.itemCount }}
        </p>
      </div>

      <div class="app-shelf-row__actions">
        <AppButton
          variant="ghost"
          size="sm"
          icon="i-lucide-pencil"
          :label="labels.rename"
          data-testid="ren"
          @click="emit('rename', shelf.id)"
        />
        <AppButton
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          :label="labels.delete"
          data-testid="del"
          @click="emit('delete', shelf.id)"
        />
      </div>
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
  .app-shelf-row {
    transition: box-shadow var(--dur-fast) var(--ease);

    &:hover {
      box-shadow: var(--shadow-md);
    }

    &__main {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    &__body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    &__name {
      // Reset button
      background: none;
      border: 0;
      padding: 0;
      cursor: pointer;
      text-align: start;
      // Typography
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-md);
      line-height: var(--leading-snug);
      color: var(--text-fg);
      // Truncate
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;

      &:hover {
        color: var(--brand-accent);
      }

      &:focus-visible {
        outline: none;
        box-shadow: var(--shadow-focus);
        border-radius: var(--radius-xs);
      }
    }

    &__count {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      font-family: var(--font-sans);
    }

    &__actions {
      flex-shrink: 0;
      display: flex;
      gap: var(--space-1);
      opacity: 0;
      transition: opacity var(--dur-fast) var(--ease);
    }

    &:hover &__actions,
    &:focus-within &__actions {
      opacity: 1;
    }

    @media (hover: none) {
      &__actions {
        opacity: 1;
      }
    }
  }
</style>
