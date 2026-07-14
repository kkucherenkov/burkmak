<script setup lang="ts">
  import { AppInput, AppButton, AppSwitch } from '@app/ui';
  import { ref, watch, nextTick } from 'vue';

  const props = defineProps<{ open: boolean }>();
  const emit = defineEmits<{ save: [url: string, kind: 'article' | 'bookmark']; close: [] }>();

  const { t } = useI18n();

  const url = ref('');
  const asBookmark = ref(false);
  const saving = ref(false);
  const inputRef = ref<HTMLInputElement | null>(null);

  const looksValid = computed(() => /^https?:\/\/.+\..+/.test(url.value.trim()));

  watch(
    () => props.open,
    async (isOpen) => {
      if (isOpen) {
        url.value = '';
        await nextTick();
        inputRef.value?.focus();
      }
    },
  );

  function onBackdropClick(): void {
    emit('close');
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') emit('close');
  }

  function onSave(): void {
    if (!looksValid.value) return;
    saving.value = true;
    try {
      emit('save', url.value.trim(), asBookmark.value ? 'bookmark' : 'article');
      asBookmark.value = false;
      emit('close');
    } finally {
      saving.value = false;
    }
  }
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="add-link-modal__backdrop"
      role="presentation"
      @click.self="onBackdropClick"
      @keydown="onKeydown"
    >
      <div
        class="add-link-modal__sheet"
        role="dialog"
        aria-modal="true"
        :aria-label="t('addModal.title')"
      >
        <h2 class="add-link-modal__title">
          {{ t('addModal.title') }}
        </h2>
        <form class="add-link-modal__form" @submit.prevent="onSave">
          <AppInput
            ref="inputRef"
            v-model="url"
            type="url"
            :placeholder="t('addModal.placeholder')"
          />
          <AppSwitch v-model="asBookmark" :label="t('addModal.asBookmark')" size="sm" />
          <div class="add-link-modal__actions">
            <AppButton
              type="button"
              variant="outline"
              color="neutral"
              :label="t('addModal.cancel')"
              @click="emit('close')"
            />
            <AppButton
              type="submit"
              :loading="saving"
              :disabled="!looksValid"
              :label="t('addModal.save')"
            />
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
  .add-link-modal {
    &__backdrop {
      position: fixed;
      inset: 0;
      background: var(--surface-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-overlay);
    }

    &__sheet {
      background: var(--surface-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: var(--space-8);
      width: min(90vw, 28rem);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      z-index: var(--z-modal);
    }

    &__title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
      margin: 0;
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    &__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }
  }
</style>
