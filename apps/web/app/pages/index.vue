<script setup lang="ts">
  const { t } = useI18n({ useScope: 'local' });
</script>

<i18n lang="json">
{
  "en": {
    "title": "Welcome to YourApp"
  },
  "ru": {
    "title": "Добро пожаловать в YourApp"
  }
}
</i18n>

<template>
  <div class="page-home">
    <h1>{{ t('title') }}</h1>
  </div>
</template>

<style scoped lang="scss">
  .page-home {
    padding: var(--space-8);
  }
</style>
