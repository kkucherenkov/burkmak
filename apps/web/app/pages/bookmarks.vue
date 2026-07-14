<script setup lang="ts">
  import { AppItemCard, AppEmptyState, AppSkeleton, AppButton } from '@app/ui';
  import { computed, onMounted, ref, watch } from 'vue';

  import { toCardData } from '~/utils/to-card-data';

  definePageMeta({ middleware: 'auth' });
  const { t } = useI18n();

  const store = useItems('bookmark');
  useEvents();

  const errored = ref(false);

  async function load(): Promise<void> {
    errored.value = false;
    try {
      await store.load();
    } catch {
      errored.value = true;
    }
  }

  onMounted(load);

  // Re-load when the search term changes (bookmarks have no segment/tag bar).
  watch(
    () => store.filters.value.q,
    () => {
      void load();
    },
  );

  const cardLabels = computed(() => ({
    status: t('library.status'),
    favorite: t('bookmarks.act.favorite'),
    archive: t('library.act.archive'),
    delete: t('bookmarks.act.delete'),
  }));

  function openBookmark(id: string): void {
    const item = store.items.value.find((it) => it.id === id);
    if (item) globalThis.window.open(item.url, '_blank', 'noopener');
  }
</script>

<template>
  <div class="page-bookmarks">
    <header class="page-bookmarks__head">
      <h1 class="page-bookmarks__title">
        {{ t('bookmarks.title') }}
      </h1>
    </header>

    <div v-if="store.loading.value" class="page-bookmarks__list">
      <AppSkeleton v-for="n in 5" :key="n" variant="image" />
    </div>

    <div v-else-if="errored" class="page-bookmarks__state">
      <AppEmptyState icon="i-lucide-triangle-alert" :title="t('bookmarks.error')" />
      <AppButton variant="solid" color="primary" :label="t('bookmarks.retry')" @click="load" />
    </div>

    <div v-else-if="store.items.value.length > 0" class="page-bookmarks__list">
      <AppItemCard
        v-for="it in store.items.value"
        :key="it.id"
        :item="toCardData(it)"
        :labels="cardLabels"
        variant="bookmark"
        @open="openBookmark($event)"
        @toggle-favorite="store.toggleFavorite(it)"
        @delete="store.remove($event)"
        @tag-click="store.filters.value.tag = $event"
      />
    </div>

    <AppEmptyState
      v-else
      icon="i-lucide-bookmark"
      :title="t('bookmarks.empty')"
      :description="t('bookmarks.emptyHint')"
    />
  </div>
</template>

<style scoped lang="scss">
  .page-bookmarks {
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
