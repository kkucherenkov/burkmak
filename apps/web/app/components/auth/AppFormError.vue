<script setup lang="ts">
  defineProps<{ message: string }>();
</script>

<template>
  <p v-if="message" class="app-form-error" role="alert">
    {{ message }}
  </p>
</template>

<style scoped lang="scss">
  .app-form-error {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--status-error-subtle);
    color: var(--status-error-fg);
    font-size: var(--text-sm);
  }
</style>
