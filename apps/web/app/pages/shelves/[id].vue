<script setup lang="ts">
  import { AppItemCard, AppEmptyState, AppSkeleton, AppButton } from '@app/ui';
  import { computed, onMounted, ref } from 'vue';

  import { removeItemById, upsertItem } from '~/utils/items-store';
  import { toCardData } from '~/utils/to-card-data';

  import type { components } from '@app/specs';

  definePageMeta({ middleware: 'auth' });

  type Item = components['schemas']['Item'];

  const { t } = useI18n();
  const route = useRoute();
  const id = route.params.id as string;

  const api = useApi();
  const shelvesStore = useShelves();

  // Page-local list, deliberately not the shared `useItems` per-kind store:
  // that state is keyed only by kind (see useItems.ts), so a shelf-filtered
  // fetch would clobber the library/bookmarks lists sharing the same key.
  // There's also no filters ref here (no search/segment on this page), so
  // useFiltersReload does not apply.
  const items = ref<Item[]>([]);
  const loading = ref(false);
  const errored = ref(false);

  const shelf = computed(() => shelvesStore.shelves.value.find((s) => s.id === id) ?? null);

  // Page-local affordance for shelvesStore.addItem/removeItem, which — unlike
  // load/create/rename/remove — reject on failure rather than swallowing into
  // `shelvesStore.error` (see useShelves.ts's UseShelvesReturn doc comments).
  // Mirrors items/[id].vue's runAction so a rejection surfaces a dismissible
  // banner instead of becoming an unhandled rejection with no user feedback.
  const actionError = ref<string | null>(null);
  async function runAction(fn: () => Promise<void>): Promise<void> {
    actionError.value = null;
    try {
      await fn();
    } catch {
      actionError.value = t('reader.actionFailed');
    }
  }

  async function load(): Promise<void> {
    loading.value = true;
    errored.value = false;
    try {
      const page = await api.getItems({ shelf: id });
      items.value = [...page.items];
    } catch {
      errored.value = true;
    } finally {
      loading.value = false;
    }
  }

  onMounted(async () => {
    if (shelvesStore.shelves.value.length === 0) await shelvesStore.load();
    await load();
  });

  const cardLabels = computed(() => ({
    status: t('library.status'),
    favorite: t('library.act.favorite'),
    delete: t('shelves.removeFromShelf'),
  }));

  async function toggleFavorite(item: Item): Promise<void> {
    items.value = upsertItem(items.value, { ...item, favorite: !item.favorite });
    await api.updateItem(item.id, { favorite: !item.favorite });
  }

  async function removeFromShelf(itemId: string): Promise<void> {
    await shelvesStore.removeItem(id, itemId);
    items.value = removeItemById(items.value, itemId);
  }
</script>

<template>
  <div class="page-shelf-detail">
    <header class="page-shelf-detail__head">
      <NuxtLink to="/shelves" class="page-shelf-detail__back">
        {{ t('shelves.backToShelves') }}
      </NuxtLink>
      <h1 class="page-shelf-detail__title">
        {{ shelf?.name ?? t('shelves.title') }}
      </h1>
    </header>

    <p v-if="actionError" class="page-shelf-detail__error" role="alert">
      <span class="page-shelf-detail__error-text">{{ actionError }}</span>
      <button
        type="button"
        class="page-shelf-detail__error-dismiss"
        :aria-label="t('reader.dismiss')"
        @click="actionError = null"
      >
        <span aria-hidden="true">×</span>
      </button>
    </p>

    <div v-if="loading" class="page-shelf-detail__list">
      <AppSkeleton v-for="n in 5" :key="n" variant="image" />
    </div>

    <div v-else-if="errored" class="page-shelf-detail__state">
      <AppEmptyState icon="i-lucide-triangle-alert" :title="t('shelves.loadError')" />
      <AppButton variant="solid" color="primary" :label="t('shelves.retry')" @click="load" />
    </div>

    <div v-else-if="items.length > 0" class="page-shelf-detail__list">
      <AppItemCard
        v-for="it in items"
        :key="it.id"
        :item="toCardData(it)"
        :labels="cardLabels"
        variant="article"
        :archivable="false"
        @open="navigateTo(`/items/${$event}`)"
        @toggle-favorite="toggleFavorite(it)"
        @delete="runAction(() => removeFromShelf($event))"
      />
    </div>

    <AppEmptyState v-else icon="i-lucide-layout-list" :title="t('shelves.shelfEmpty')" />
  </div>
</template>

<style scoped lang="scss">
  .page-shelf-detail {
    max-width: 48rem;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);

    &__head {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    &__back {
      align-self: flex-start;
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: var(--fw-medium);
      color: var(--text-secondary);
      text-decoration: none;

      &:hover {
        color: var(--brand-accent);
      }
    }

    &__title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--fw-bold);
      color: var(--text-fg);
    }

    &__error {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin: 0;
      padding: var(--space-3) var(--space-4);
      color: var(--status-error-fg);
      background: var(--status-error-subtle);
      border: 1px solid var(--status-error-fg);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      font-weight: var(--fw-medium);
    }

    &__error-text {
      min-width: 0;
    }

    &__error-dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--space-6);
      height: var(--space-6);
      flex: none;
      padding: 0;
      color: inherit;
      background: transparent;
      border: 0;
      border-radius: var(--radius-md);
      font-size: var(--text-lg);
      line-height: 1;
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease);

      &:hover {
        background: var(--surface-raised);
      }

      &:focus-visible {
        outline: 2px solid var(--status-error-fg);
        outline-offset: 2px;
      }
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
