<script setup lang="ts">
  import { AppFilterBar, AppItemCard, AppEmptyState, AppSkeleton, AppButton } from '@app/ui';
  import { onMounted, ref, computed } from 'vue';

  import AppAddBar from '~/components/library/AppAddBar.vue';
  import AddLinkModal from '~/components/library/AddLinkModal.vue';
  import { useFiltersReload } from '~/composables/useFiltersReload';
  import { toCardData } from '~/utils/to-card-data';

  definePageMeta({ middleware: 'auth' });
  const { t } = useI18n();

  const store = useItems('article');
  const tagStore = useTags();
  useEvents('article');

  const modalOpen = ref(false);

  onMounted(async () => {
    await Promise.all([store.load(), tagStore.load()]);
  });

  // Deep-watch every filter field (segment/q/tag); any nested change reloads.
  // void is intentional — fire-and-forget inside watch callback.
  useFiltersReload(store.filters, () => {
    void store.load();
  });

  const tagOptions = computed(() =>
    tagStore.tags.value.map((tg) => ({ id: tg.slug, label: `${tg.name} (${String(tg.count)})` })),
  );

  const labels = computed(() => ({
    unread: t('library.seg.unread'),
    read: t('library.seg.read'),
    archived: t('library.seg.archived'),
    favorite: t('library.seg.favorite'),
    allTags: t('library.allTags'),
    search: t('library.search'),
  }));

  const cardLabels = computed(() => ({
    status: t('library.status'),
    favorite: t('library.act.favorite'),
    archive: t('library.act.archive'),
    delete: t('library.act.delete'),
  }));

  function setSegment(segment: 'unread' | 'read' | 'archived' | 'favorite'): void {
    store.filters.value = { ...store.filters.value, segment };
  }
</script>

<template>
  <div class="page-library">
    <header class="page-library__head">
      <h1 class="page-library__title">
        {{ t('library.title') }}
      </h1>
      <AppButton
        variant="ghost"
        :label="t('library.saveLink')"
        icon="i-lucide-plus"
        @click="modalOpen = true"
      />
    </header>

    <AppAddBar @save="store.save" />

    <AppFilterBar
      :segment="store.filters.value.segment"
      :q="store.filters.value.q"
      :tag="store.filters.value.tag"
      :tag-options="tagOptions"
      :labels="labels"
      @update:segment="setSegment"
      @update:q="store.filters.value.q = $event"
      @update:tag="store.filters.value.tag = $event"
    />

    <div v-if="store.loading.value" class="page-library__list">
      <AppSkeleton v-for="n in 5" :key="n" variant="image" />
    </div>

    <div v-else-if="store.items.value.length > 0" class="page-library__list">
      <AppItemCard
        v-for="it in store.items.value"
        :key="it.id"
        :item="toCardData(it)"
        :labels="cardLabels"
        @open="navigateTo(`/items/${$event}`)"
        @toggle-favorite="store.toggleFavorite(it)"
        @archive="store.setReadState(it, 'archived')"
        @delete="store.remove($event)"
        @tag-click="store.filters.value.tag = $event"
      />
    </div>

    <AppEmptyState
      v-else
      icon="i-lucide-inbox"
      :title="t('library.empty')"
      :description="t('library.emptyHint')"
    />

    <AddLinkModal :open="modalOpen" @save="store.save" @close="modalOpen = false" />
  </div>
</template>

<style scoped lang="scss">
  .page-library {
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
  }
</style>
