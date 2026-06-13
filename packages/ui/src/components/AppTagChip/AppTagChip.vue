<script setup lang="ts">
  import AppChip from '../AppChip/AppChip.vue';

  withDefaults(defineProps<{ label: string; selected?: boolean; removable?: boolean }>(), {
    selected: false,
    removable: false,
  });

  const emit = defineEmits<{ click: [event: MouseEvent]; remove: [event: Event] }>();
</script>

<template>
  <AppChip
    class="app-tag-chip"
    color="primary"
    variant="soft"
    size="sm"
    :label="label"
    :selected="selected"
    :dismissible="removable"
    @click="emit('click', $event)"
    @dismiss="emit('remove', $event)"
  />
</template>

<style lang="scss" scoped>
  .app-tag-chip {
    font-family: var(--font-sans);
  }
</style>
