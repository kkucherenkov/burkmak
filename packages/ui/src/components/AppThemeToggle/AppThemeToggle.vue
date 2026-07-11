<script setup lang="ts">
  import { computed } from 'vue';

  import AppButton from '../AppButton/AppButton.vue';

  export type AppThemeMode = 'light' | 'dark';

  const props = defineProps<{
    /** Currently resolved color mode. */
    mode: AppThemeMode;
    /** Accessible name for the control, e.g. "Toggle theme". Translated by the consumer. */
    label: string;
  }>();

  const emit = defineEmits<{ toggle: [] }>();

  // The icon shows the destination, not the current state: moon in light mode
  // ("click for dark"), sun in dark mode ("click for light").
  const icon = computed(() => (props.mode === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'));
</script>

<template>
  <AppButton
    class="app-theme-toggle"
    variant="ghost"
    color="neutral"
    size="sm"
    :icon="icon"
    :aria-label="label"
    :title="label"
    @click="emit('toggle')"
  />
</template>
