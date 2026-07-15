<script setup lang="ts">
  import { useId } from 'vue';

  export interface AppShelfPickerShelf {
    id: string;
    name: string;
  }

  const props = defineProps<{
    shelves: AppShelfPickerShelf[];
    selectedIds: string[];
    labels: { add: string; remove: string; empty: string };
  }>();

  const emit = defineEmits<{
    toggle: [shelfId: string, next: boolean];
  }>();

  // Prefix so each shelf's checkbox gets a unique, stable id to associate
  // with its <label for="...">, even across multiple AppShelfPicker instances
  // rendered on the same page.
  const idPrefix = useId();

  function checkboxId(shelfId: string): string {
    return `${idPrefix}-${shelfId}`;
  }

  function isSelected(shelfId: string): boolean {
    return props.selectedIds.includes(shelfId);
  }

  function onChange(shelfId: string, event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    emit('toggle', shelfId, next);
  }
</script>

<template>
  <div class="app-shelf-picker">
    <p v-if="shelves.length === 0" class="app-shelf-picker__empty">
      {{ labels.empty }}
    </p>
    <ul v-else class="app-shelf-picker__list">
      <li v-for="shelf in shelves" :key="shelf.id" class="app-shelf-picker__row">
        <input
          :id="checkboxId(shelf.id)"
          type="checkbox"
          class="app-shelf-picker__checkbox"
          :checked="isSelected(shelf.id)"
          @change="onChange(shelf.id, $event)"
        />
        <label :for="checkboxId(shelf.id)" class="app-shelf-picker__label">
          {{ shelf.name }}
        </label>
        <span class="app-shelf-picker__state">
          {{ isSelected(shelf.id) ? labels.remove : labels.add }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
  .app-shelf-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    &__empty {
      margin: 0;
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      text-align: center;
      padding: var(--space-6) 0;
    }

    &__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    &__row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);

      &:hover {
        background-color: var(--surface-raised);
      }
    }

    &__checkbox {
      flex-shrink: 0;
      width: var(--space-8);
      height: var(--space-8);
      accent-color: var(--brand-accent);
      cursor: pointer;

      &:focus-visible {
        outline: none;
        box-shadow: var(--shadow-focus);
        border-radius: var(--radius-xs);
      }
    }

    &__label {
      flex: 1;
      min-width: 0;
      font-family: var(--font-sans);
      font-size: var(--text-md);
      color: var(--text-fg);
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__state {
      flex-shrink: 0;
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      color: var(--text-tertiary);
    }
  }
</style>
