<script setup lang="ts">
  import { computed } from 'vue';

  import AppButton from '../AppButton/AppButton.vue';
  import AppCard from '../AppCard/AppCard.vue';
  import AppSkeleton from '../AppSkeleton/AppSkeleton.vue';
  import AppStatusBadge from '../AppStatusBadge/AppStatusBadge.vue';
  import AppTagChip from '../AppTagChip/AppTagChip.vue';

  export interface AppItemCardData {
    id: string;
    url: string;
    title: string | null;
    siteName: string | null;
    excerpt: string | null;
    faviconUrl: string | null;
    leadImageUrl: string | null;
    status: 'pending' | 'ready' | 'failed';
    readState: 'unread' | 'read' | 'archived';
    favorite: boolean;
    tags: string[];
  }

  const props = withDefaults(
    defineProps<{
      item: AppItemCardData;
      // `archive` is only rendered in the `article` variant (see the button's
      // v-if below) — bookmarks never expose an archive action, so callers
      // building bookmark-variant labels don't need to supply it.
      labels: { status: string; favorite: string; archive?: string; delete: string };
      fresh?: boolean;
      variant?: 'article' | 'bookmark';
    }>(),
    { fresh: false, variant: 'article' },
  );

  const emit = defineEmits<{
    open: [id: string];
    toggleFavorite: [id: string];
    archive: [id: string];
    delete: [id: string];
    tagClick: [tag: string];
  }>();

  const displayTitle = computed(() => props.item.title ?? props.item.url);
  const faviconInitial = computed(
    () => (props.item.siteName ?? props.item.url)[0]?.toUpperCase() ?? '?',
  );
  const isPending = computed(() => props.item.status === 'pending');
  const rootClasses = computed(() => [
    'app-item-card',
    `app-item-card--${props.item.status}`,
    { 'app-item-card--fresh': props.fresh, 'app-item-card--favorite': props.item.favorite },
  ]);
</script>

<template>
  <AppCard :class="rootClasses">
    <div class="app-item-card__main">
      <div class="app-item-card__favicon" aria-hidden="true">
        <img v-if="item.faviconUrl" :src="item.faviconUrl" alt="" />
        <span v-else>{{ faviconInitial }}</span>
      </div>

      <div class="app-item-card__body">
        <div class="app-item-card__titlerow">
          <button type="button" class="app-item-card__title" @click="emit('open', item.id)">
            {{ displayTitle }}
          </button>
          <AppStatusBadge
            v-if="item.status !== 'ready'"
            :status="item.status"
            :label="labels.status"
          />
        </div>

        <p class="app-item-card__meta">
          {{ item.siteName ?? item.url }}
        </p>

        <div v-if="isPending" class="app-item-card__pending">
          <AppSkeleton variant="text" />
          <AppSkeleton variant="meta" />
        </div>
        <p v-else-if="item.excerpt" class="app-item-card__excerpt">
          {{ item.excerpt }}
        </p>

        <div v-if="item.tags.length > 0" class="app-item-card__tags">
          <AppTagChip
            v-for="tag in item.tags"
            :key="tag"
            :label="tag"
            @click="emit('tagClick', tag)"
          />
        </div>
      </div>

      <div class="app-item-card__actions">
        <AppButton
          variant="ghost"
          size="sm"
          icon="i-lucide-star"
          :label="labels.favorite"
          data-testid="fav"
          @click="emit('toggleFavorite', item.id)"
        />
        <AppButton
          v-if="props.variant === 'article'"
          variant="ghost"
          size="sm"
          icon="i-lucide-archive"
          :label="labels.archive"
          data-testid="arc"
          @click="emit('archive', item.id)"
        />
        <AppButton
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          :label="labels.delete"
          data-testid="del"
          @click="emit('delete', item.id)"
        />
      </div>
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
  .app-item-card {
    transition: box-shadow var(--dur-fast) var(--ease);

    &:hover {
      box-shadow: var(--shadow-md);
    }

    &--fresh {
      border-color: var(--brand-accent);
    }

    &__main {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
    }

    &__favicon {
      flex-shrink: 0;
      width: var(--space-10);
      height: var(--space-10);
      border-radius: var(--radius-md);
      background-color: var(--brand-accent-subtle);
      color: var(--brand-accent);
      display: grid;
      place-items: center;
      font-family: var(--font-sans);
      font-size: var(--text-md);
      font-weight: var(--fw-semibold);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    &__titlerow {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    &__title {
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

    &__meta {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      font-family: var(--font-sans);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__pending {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    &__excerpt {
      margin: 0;
      font-family: var(--font-reading);
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
      color: var(--text-secondary);
      // 2-line clamp
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    &__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    &__actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
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

    &--favorite {
      [data-testid='fav'] {
        color: var(--brand-accent);
      }
    }
  }
</style>
