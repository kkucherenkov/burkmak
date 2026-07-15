<script setup lang="ts">
  import { AppShelfRow, AppEmptyState, AppSkeleton, AppButton, AppInput } from '@app/ui';
  import type { AppShelfRowData } from '@app/ui';
  import { computed, onMounted, ref } from 'vue';

  definePageMeta({ middleware: 'auth' });
  const { t } = useI18n();

  const store = useShelves();

  const newName = ref('');
  const creating = ref(false);
  // Mirrors `store.error` at the moment of the last create/rename/delete call —
  // `store.error` itself is a shared ref that a *later* successful action never
  // resets, so reading it directly here would risk showing a stale message.
  const actionError = ref<string | null>(null);

  onMounted(() => {
    void store.load();
  });

  const actionErrorText = computed(() => {
    switch (actionError.value) {
      case 'name-conflict': {
        return t('shelves.nameConflict');
      }
      case 'create-failed': {
        return t('shelves.createError');
      }
      case 'rename-failed': {
        return t('shelves.renameError');
      }
      case 'delete-failed': {
        return t('shelves.deleteError');
      }
      default: {
        return '';
      }
    }
  });

  function rowData(shelf: { id: string; name: string; itemCount: number }): AppShelfRowData {
    return { id: shelf.id, name: shelf.name, itemCount: shelf.itemCount };
  }

  function rowLabels(shelf: { itemCount: number }): {
    rename: string;
    delete: string;
    itemCount: string;
  } {
    return {
      rename: t('shelves.rename'),
      delete: t('shelves.delete'),
      itemCount: t('shelves.itemCount', { count: shelf.itemCount }),
    };
  }

  async function onCreate(): Promise<void> {
    const name = newName.value.trim();
    if (!name) return;
    creating.value = true;
    store.error.value = null;
    try {
      const created = await store.create(name);
      if (created) {
        newName.value = '';
        actionError.value = null;
      } else {
        actionError.value = store.error.value;
      }
    } finally {
      creating.value = false;
    }
  }

  async function onRename(id: string): Promise<void> {
    const shelf = store.shelves.value.find((s) => s.id === id);
    const name = globalThis.prompt(t('shelves.rename'), shelf?.name ?? '');
    if (!name?.trim()) return;
    store.error.value = null;
    await store.rename(id, name.trim());
    actionError.value = store.error.value;
  }

  async function onDelete(id: string): Promise<void> {
    if (!globalThis.confirm(t('shelves.deleteConfirm'))) return;
    store.error.value = null;
    await store.remove(id);
    actionError.value = store.error.value;
  }
</script>

<template>
  <div class="page-shelves">
    <header class="page-shelves__head">
      <h1 class="page-shelves__title">
        {{ t('shelves.title') }}
      </h1>
    </header>

    <form
      class="page-shelves__toolbar"
      @submit.prevent="onCreate"
    >
      <AppInput
        v-model="newName"
        class="page-shelves__name-input"
        :placeholder="t('shelves.namePlaceholder')"
        size="sm"
      />
      <AppButton
        type="submit"
        variant="solid"
        color="primary"
        :label="t('shelves.create')"
        :loading="creating"
      />
    </form>

    <p
      v-if="actionErrorText"
      class="page-shelves__action-error"
    >
      {{ actionErrorText }}
    </p>

    <div
      v-if="store.loading.value"
      class="page-shelves__list"
    >
      <AppSkeleton
        v-for="n in 5"
        :key="n"
        variant="image"
      />
    </div>

    <div
      v-else-if="store.error.value === 'load-failed'"
      class="page-shelves__state"
    >
      <AppEmptyState
        icon="i-lucide-triangle-alert"
        :title="t('shelves.loadError')"
      />
      <AppButton
        variant="solid"
        color="primary"
        :label="t('shelves.retry')"
        @click="store.load()"
      />
    </div>

    <div
      v-else-if="store.shelves.value.length > 0"
      class="page-shelves__list"
    >
      <AppShelfRow
        v-for="sh in store.shelves.value"
        :key="sh.id"
        :shelf="rowData(sh)"
        :labels="rowLabels(sh)"
        @open="navigateTo(`/shelves/${$event}`)"
        @rename="onRename($event)"
        @delete="onDelete($event)"
      />
    </div>

    <AppEmptyState
      v-else
      icon="i-lucide-layout-list"
      :title="t('shelves.empty')"
    />
  </div>
</template>

<style scoped lang="scss">
  .page-shelves {
    max-width: 48rem;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &__title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--fw-bold);
      color: var(--text-fg);
    }

    &__toolbar {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    &__name-input {
      max-width: 20rem;
      flex: 1;
    }

    &__action-error {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--status-error-fg);
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    &__state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }
  }
</style>
