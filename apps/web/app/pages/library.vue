<script setup lang="ts">
  import { AppFilterBar, AppItemCard, AppEmptyState, AppSkeleton } from '@app/ui';
  import { onMounted, ref, watch, computed } from 'vue';

  import AppAddBar from '~/components/library/AppAddBar.vue';
  import AddLinkModal from '~/components/library/AddLinkModal.vue';
  import { toCardData } from '~/utils/to-card-data';

  definePageMeta({ middleware: 'auth' });
  const { t } = useI18n({ useScope: 'local' });

  const store = useItems();
  const tagStore = useTags();
  useEvents();

  const modalOpen = ref(false);

  onMounted(async () => {
    await Promise.all([store.load(), tagStore.load()]);
  });

  // Deep-watch a snapshot of filters; any nested change (segment/q/tag) triggers reload.
  // void is intentional — fire-and-forget inside watch callback.
  watch(
    () => ({ ...store.filters.value }),
    () => {
      void store.load();
    },
    { deep: true },
  );

  const tagOptions = computed(() =>
    tagStore.tags.value.map((tg) => ({ id: tg.slug, label: `${tg.name} (${String(tg.count)})` })),
  );

  const labels = computed(() => ({
    unread: t('seg.unread'),
    read: t('seg.read'),
    archived: t('seg.archived'),
    favorite: t('seg.favorite'),
    allTags: t('allTags'),
    search: t('search'),
  }));

  const cardLabels = computed(() => ({
    status: t('status'),
    favorite: t('act.favorite'),
    archive: t('act.archive'),
    delete: t('act.delete'),
  }));

  function setSegment(segment: 'unread' | 'read' | 'archived' | 'favorite'): void {
    store.filters.value = { ...store.filters.value, segment };
  }
</script>

<i18n lang="json">
{
  "en": {
    "title": "Library",
    "empty": "Nothing here yet",
    "emptyHint": "Paste a link to begin.",
    "allTags": "All tags",
    "search": "Search library",
    "status": "Pending",
    "seg": {
      "unread": "Unread",
      "read": "Read",
      "archived": "Archived",
      "favorite": "Favorite"
    },
    "act": {
      "favorite": "Favorite",
      "archive": "Archive",
      "delete": "Delete"
    }
  },
  "ru": {
    "title": "Библиотека",
    "empty": "Пока пусто",
    "emptyHint": "Вставьте ссылку, чтобы начать.",
    "allTags": "Все теги",
    "search": "Поиск",
    "status": "В обработке",
    "seg": {
      "unread": "Не прочитано",
      "read": "Прочитано",
      "archived": "В архиве",
      "favorite": "Избранное"
    },
    "act": {
      "favorite": "В избранное",
      "archive": "В архив",
      "delete": "Удалить"
    }
  }
}
</i18n>

<template>
  <div class="page-library">
    <header class="page-library__head">
      <h1 class="page-library__title">
        {{ t('title') }}
      </h1>
    </header>

    <AppAddBar @save="store.save($event)" />

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

    <AppEmptyState v-else icon="i-lucide-inbox" :title="t('empty')" :description="t('emptyHint')" />

    <AddLinkModal :open="modalOpen" @save="store.save($event)" @close="modalOpen = false" />
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
