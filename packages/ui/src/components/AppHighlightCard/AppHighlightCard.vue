<script setup lang="ts">
  import { ref, watch } from 'vue';

  import type {
    AppHighlightColor,
    AppHighlightData,
  } from '../AppArticleReader/AppArticleReader.vue';
  import AppButton from '../AppButton/AppButton.vue';
  import AppTextarea from '../AppTextarea/AppTextarea.vue';

  export interface AppHighlightCardHighlight extends AppHighlightData {
    note?: string | null;
  }

  const props = withDefaults(
    defineProps<{
      highlight: AppHighlightCardHighlight;
      editing?: boolean;
      labels: {
        edit: string;
        delete: string;
        save: string;
        cancel: string;
        notePlaceholder: string;
      };
    }>(),
    {
      editing: false,
    },
  );

  const emit = defineEmits<{
    edit: [];
    delete: [];
    save: [note: string];
    cancel: [];
  }>();

  // Local draft initialised from the current note; re-synced when highlight changes.
  const draft = ref(props.highlight.note ?? '');

  watch(
    () => props.highlight.note,
    (note) => {
      draft.value = note ?? '';
    },
  );

  function onSave(): void {
    emit('save', draft.value);
  }
</script>

<template>
  <div
    :class="['app-highlight-card', `app-highlight-card--${highlight.color as AppHighlightColor}`]"
  >
    <blockquote class="app-highlight-card__quote">
      {{ highlight.quote }}
    </blockquote>

    <!-- Editing state: note textarea + save/cancel actions -->
    <form v-if="editing" class="app-highlight-card__editor" @submit.prevent="onSave">
      <AppTextarea
        v-model="draft"
        :placeholder="labels.notePlaceholder"
        :aria-label="labels.notePlaceholder"
        :rows="3"
      />
      <div class="app-highlight-card__editor-actions">
        <AppButton
          variant="ghost"
          color="neutral"
          size="sm"
          :label="labels.cancel"
          data-testid="cancel-btn"
          @click="emit('cancel')"
        />
        <AppButton
          type="submit"
          variant="solid"
          color="primary"
          size="sm"
          :label="labels.save"
          data-testid="save-btn"
          @click="onSave"
        />
      </div>
    </form>

    <!-- View state: note (if any) + action buttons -->
    <template v-else>
      <p v-if="highlight.note" class="app-highlight-card__note">
        {{ highlight.note }}
      </p>

      <footer class="app-highlight-card__foot">
        <AppButton
          variant="ghost"
          color="neutral"
          size="sm"
          :label="labels.edit"
          data-testid="edit-btn"
          @click="emit('edit')"
        />
        <AppButton
          variant="ghost"
          color="error"
          size="sm"
          :label="labels.delete"
          data-testid="delete-btn"
          @click="emit('delete')"
        />
      </footer>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .app-highlight-card {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface-page);
    border: 1px solid var(--border-default);
    // Color rail on the leading edge — keyed to the highlight color.
    // WHY: --highlight-*-rail tokens (deeper, more-saturated variants of the
    // swatch fills) are defined in packages/ui/src/styles.css. They are used
    // here (not the pale swatch color) because the rail must stand out
    // against the card background at its narrow width (var(--space-1)).
    border-inline-start: var(--space-1) solid var(--border-strong);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--dur-base) var(--ease-default);

    &:hover {
      box-shadow: var(--shadow-md);
    }

    &--yellow {
      border-inline-start-color: var(--highlight-yellow-rail);
    }

    &--green {
      border-inline-start-color: var(--highlight-green-rail);
    }

    &--blue {
      border-inline-start-color: var(--highlight-blue-rail);
    }

    &--pink {
      border-inline-start-color: var(--highlight-pink-rail);
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
      justify-content: flex-end;
    }

    &__editor {
      display: grid;
      gap: var(--space-3);
    }

    &__editor-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }
  }
</style>
