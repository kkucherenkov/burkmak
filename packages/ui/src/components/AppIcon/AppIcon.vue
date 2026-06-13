<script setup lang="ts">
  import UIcon from '@nuxt/ui/runtime/vue/components/Icon.vue';
  import { computed } from 'vue';

  type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  const props = withDefaults(
    defineProps<{
      name: string;
      size?: Size;
      label?: string;
    }>(),
    { size: 'md', label: undefined },
  );

  const decorative = computed(() => props.label === undefined || props.label === '');
</script>

<template>
  <UIcon
    :name="name"
    :class="['app-icon', `app-icon--${size}`]"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : label"
  />
</template>

<style lang="scss" scoped>
  .app-icon {
    display: inline-flex;
    flex-shrink: 0;
    color: currentcolor;

    &--xs {
      width: var(--space-6);
      height: var(--space-6);
    }

    &--sm {
      width: var(--space-8);
      height: var(--space-8);
    }

    &--md {
      width: var(--space-10);
      height: var(--space-10);
    }

    &--lg {
      width: var(--space-12);
      height: var(--space-12);
    }

    &--xl {
      width: var(--space-16);
      height: var(--space-16);
    }
  }
</style>
