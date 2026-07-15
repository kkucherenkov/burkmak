<script setup lang="ts">
  import {
    AppItemCard,
    AppEmptyState,
    AppSkeleton,
    AppButton,
    AppInput,
    AppTagChip,
  } from '@app/ui';
  import { computed, onMounted, ref } from 'vue';

  import { useFiltersReload } from '~/composables/useFiltersReload';
  import { toCardData } from '~/utils/to-card-data';

  definePageMeta({ middleware: 'auth' });
  const { t } = useI18n();

  const store = useItems('bookmark');
  useEvents('bookmark');

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

  // Deep-watch every filter field (q/tag); bookmarks have no segment bar, but
  // a tag click (see @tag-click below) still needs to trigger a reload — a
  // shallow watch on `q` alone silently misses it.
  useFiltersReload(store.filters, () => {
    void load();
  });

  const cardLabels = computed(() => ({
    status: t('library.status'),
    favorite: t('bookmarks.act.favorite'),
    delete: t('bookmarks.act.delete'),
  }));

  function openBookmark(id: string): void {
    const item = store.items.value.find((it) => it.id === id);
    if (item) globalThis.window.open(item.url, '_blank', 'noopener');
  }

  function clearTagFilter(): void {
    store.filters.value.tag = null;
  }
</script>

<template>
  <div class="page-bookmarks">
    <header class="page-bookmarks__head">
      <h1 class="page-bookmarks__title">
        {{ t('bookmarks.title') }}
      </h1>
    </header>

    <div class="page-bookmarks__toolbar">
      <AppInput
        class="page-bookmarks__search"
        type="search"
        :model-value="store.filters.value.q"
        :placeholder="t('bookmarks.search')"
        size="sm"
        @update:model-value="store.filters.value.q = $event"
      />
      <div v-if="store.filters.value.tag" class="page-bookmarks__tag-filter">
        <span class="page-bookmarks__tag-filter-label">{{ t('bookmarks.filteringByTag') }}</span>
        <AppTagChip
          :label="store.filters.value.tag"
          removable
          selected
          @remove="clearTagFilter"
          @click="clearTagFilter"
        />
      </div>
    </div>

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

    &__toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    &__search {
      max-width: 20rem;
      flex: 1;
    }

    &__tag-filter {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    &__tag-filter-label {
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      color: var(--text-tertiary);
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
