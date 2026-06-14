<script setup lang="ts">
  import { AppTagChip, AppButton, AppInput, AppStatusBadge } from '@app/ui';
  import { ref, onMounted } from 'vue';

  import type { components } from '@app/specs';

  definePageMeta({ middleware: 'auth' });
  const { t } = useI18n();
  const route = useRoute();
  const api = useApi();
  const id = route.params.id as string;

  type Item = components['schemas']['Item'];
  const item = ref<Item | null>(null);
  const newTag = ref('');

  async function refresh(): Promise<void> {
    item.value = await api.getItem(id);
  }
  onMounted(refresh);

  async function setReadState(readState: Item['readState']): Promise<void> {
    item.value = await api.updateItem(id, { readState });
  }
  async function toggleFavorite(): Promise<void> {
    if (item.value) item.value = await api.updateItem(id, { favorite: !item.value.favorite });
  }
  async function addTag(): Promise<void> {
    if (!newTag.value.trim()) return;
    item.value = await api.addItemTag(id, newTag.value.trim());
    newTag.value = '';
  }
  async function removeTag(slug: string): Promise<void> {
    await api.removeItemTag(id, slug);
    await refresh();
  }
  async function remove(): Promise<void> {
    await api.deleteItem(id);
    await navigateTo('/library');
  }
</script>

<template>
  <article v-if="item" class="page-detail">
    <header class="page-detail__bar">
      <NuxtLink to="/library" class="page-detail__back">
        {{ t('itemDetail.back') }}
      </NuxtLink>
      <div class="page-detail__bar-actions">
        <AppButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-archive"
          :label="t('itemDetail.archive')"
          @click="setReadState('archived')"
        />
        <AppButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-trash-2"
          :label="t('itemDetail.delete')"
          @click="remove"
        />
      </div>
    </header>

    <h1 class="page-detail__title">
      {{ item.title ?? item.url }}
    </h1>

    <p class="page-detail__meta">
      <span>{{ item.siteName ?? item.url }}</span>
      <AppStatusBadge
        v-if="item.status !== 'ready'"
        :status="item.status"
        :label="t('itemDetail.status')"
      />
    </p>

    <figure v-if="item.leadImageUrl" class="page-detail__lead">
      <img :src="item.leadImageUrl" alt="" />
    </figure>

    <p v-if="item.excerpt" class="page-detail__excerpt">
      {{ item.excerpt }}
    </p>

    <div class="page-detail__tags">
      <AppTagChip
        v-for="tag in item.tags"
        :key="tag"
        :label="tag"
        removable
        @remove="removeTag(tag)"
      />
      <form class="page-detail__add-tag" @submit.prevent="addTag">
        <AppInput v-model="newTag" type="text" :placeholder="t('itemDetail.addTag')" size="sm" />
      </form>
    </div>

    <div class="page-detail__controls">
      <AppButton
        size="sm"
        variant="outline"
        color="neutral"
        :label="t('itemDetail.read.unread')"
        @click="setReadState('unread')"
      />
      <AppButton
        size="sm"
        variant="outline"
        color="neutral"
        :label="t('itemDetail.read.read')"
        @click="setReadState('read')"
      />
      <AppButton
        size="sm"
        variant="outline"
        color="neutral"
        :label="t('itemDetail.read.archived')"
        @click="setReadState('archived')"
      />
      <AppButton
        size="sm"
        :variant="item.favorite ? 'solid' : 'outline'"
        :color="item.favorite ? 'primary' : 'neutral'"
        :label="t('itemDetail.favorite')"
        @click="toggleFavorite"
      />
    </div>
  </article>
</template>

<style scoped lang="scss">
  // Metadata + tags + controls sections only. Reader section is S2 — out of scope.
  .page-detail {
    max-width: 44rem;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    background: var(--surface-page);
    color: var(--text-fg);
    font-family: var(--font-sans);
    min-height: 100dvh;

    &__bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      font-weight: var(--fw-semibold);
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-md);
      padding: var(--space-1) var(--space-2);
      transition:
        color var(--dur-fast) var(--ease),
        background var(--dur-fast) var(--ease);

      &:hover {
        color: var(--text-fg);
        background: var(--surface-raised);
      }

      &:focus-visible {
        outline: 2px solid var(--brand-accent);
        outline-offset: 2px;
      }
    }

    &__bar-actions {
      display: flex;
      gap: var(--space-2);
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
      text-wrap: balance;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin: 0;
    }

    &__lead {
      margin: 0;

      img {
        width: 100%;
        border-radius: var(--radius-2xl);
        border: 1px solid var(--border-default);
        display: block;
      }
    }

    &__excerpt {
      margin: 0;
      font-family: var(--font-reading);
      font-size: var(--text-xl);
      line-height: var(--leading-relaxed);
      color: var(--text-secondary);
      max-width: 60ch;
      text-wrap: pretty;
    }

    &__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }

    &__add-tag {
      display: inline-flex;
      align-items: center;
      width: 8rem;
    }

    &__controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
  }
</style>
