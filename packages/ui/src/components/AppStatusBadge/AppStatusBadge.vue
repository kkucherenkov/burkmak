<script setup lang="ts">
  import { computed } from 'vue';

  import AppBadge from '../AppBadge/AppBadge.vue';

  type Status = 'pending' | 'ready' | 'failed';

  const props = defineProps<{ status: Status; label: string }>();

  const color = computed(() =>
    props.status === 'ready' ? 'success' : props.status === 'failed' ? 'error' : 'info',
  );
  const icon = computed(() =>
    props.status === 'ready'
      ? 'i-lucide-check'
      : props.status === 'failed'
        ? 'i-lucide-triangle-alert'
        : 'i-lucide-loader',
  );
  const rootClasses = computed(() => ['app-status-badge', `app-status-badge--${props.status}`]);
</script>

<template>
  <AppBadge
    :class="rootClasses"
    :color="color"
    variant="soft"
    size="sm"
    :icon="icon"
    :label="label"
  />
</template>

<style lang="scss" scoped>
  .app-status-badge {
    &--pending :deep(.app-badge__icon) {
      animation: app-status-pulse var(--dur-slow) var(--ease) infinite alternate;
    }
  }

  @keyframes app-status-pulse {
    from {
      opacity: var(--opacity-disabled);
    }
    to {
      opacity: 1;
    }
  }
</style>
