<script setup lang="ts">
  import { computed } from 'vue';

  import AppChip from '../AppChip/AppChip.vue';
  import AppInput from '../AppInput/AppInput.vue';
  import AppSelect, { type AppSelectOption } from '../AppSelect/AppSelect.vue';

  export type AppFilterSegment = 'unread' | 'read' | 'archived' | 'favorite';

  const props = defineProps<{
    segment: AppFilterSegment;
    q: string;
    tag: string | null;
    tagOptions: readonly AppSelectOption[];
    labels: {
      unread: string;
      read: string;
      archived: string;
      favorite: string;
      allTags: string;
      search: string;
    };
  }>();

  const emit = defineEmits<{
    'update:segment': [value: AppFilterSegment];
    'update:q': [value: string];
    'update:tag': [value: string | null];
  }>();

  const segments = computed<{ key: AppFilterSegment; label: string }[]>(() => [
    { key: 'unread', label: props.labels.unread },
    { key: 'read', label: props.labels.read },
    { key: 'archived', label: props.labels.archived },
    { key: 'favorite', label: props.labels.favorite },
  ]);
</script>

<template>
  <div class="app-filter-bar">
    <div class="app-filter-bar__segments" role="group">
      <AppChip
        v-for="s in segments"
        :key="s.key"
        class="app-filter-bar__segment"
        :label="s.label"
        :selected="segment === s.key"
        color="primary"
        variant="soft"
        size="sm"
        @click="emit('update:segment', s.key)"
      />
    </div>

    <AppSelect
      class="app-filter-bar__tags"
      :model-value="tag"
      :options="tagOptions"
      :placeholder="labels.allTags"
      size="sm"
      @update:model-value="emit('update:tag', $event)"
    />

    <AppInput
      class="app-filter-bar__search"
      type="search"
      :model-value="q"
      :placeholder="labels.search"
      size="sm"
      @update:model-value="emit('update:q', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
  .app-filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);

    &__segments {
      display: flex;
      gap: var(--space-2);
    }

    &__tags {
      margin-inline-start: auto;
    }
  }
</style>
