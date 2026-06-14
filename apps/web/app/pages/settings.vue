<script setup lang="ts">
  import { AppButton, AppSelect } from '@app/ui';

  definePageMeta({ middleware: 'auth' });
  const { t, locale, setLocale } = useI18n({ useScope: 'local' });
  const colorMode = useColorMode();

  const localeOptions = [
    { id: 'en', label: 'English' },
    { id: 'ru', label: 'Русский' },
  ];

  function toggleTheme(): void {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }
</script>

<i18n lang="json">
{
  "en": { "title": "Settings", "theme": "Toggle theme", "language": "Language" },
  "ru": { "title": "Настройки", "theme": "Сменить тему", "language": "Язык" }
}
</i18n>

<template>
  <div class="page-settings">
    <h1 class="page-settings__title">
      {{ t('title') }}
    </h1>
    <AppButton variant="outline" :label="t('theme')" @click="toggleTheme" />
    <AppSelect
      :model-value="locale"
      :options="localeOptions"
      @update:model-value="
        (v) => {
          void setLocale(v as 'en' | 'ru');
        }
      "
    />
  </div>
</template>

<style scoped lang="scss">
  .page-settings {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-8);
    max-width: 32rem;
    margin: 0 auto;

    &__title {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
    }
  }
</style>
