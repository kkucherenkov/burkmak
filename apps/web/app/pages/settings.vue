<script setup lang="ts">
  import { AppButton, AppSelect } from '@app/ui';
  import { onMounted, ref } from 'vue';

  import { buildBookmarkletHref } from '~/utils/bookmarklet';

  definePageMeta({ middleware: 'auth' });
  const { t, locale, setLocale } = useI18n();
  const colorMode = useColorMode();

  const localeOptions = [
    { id: 'en', label: 'English' },
    { id: 'ru', label: 'Русский' },
  ];

  function toggleTheme(): void {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }

  const bookmarkletHref = ref('');
  const copied = ref(false);

  onMounted(() => {
    bookmarkletHref.value = buildBookmarkletHref(globalThis.location.origin);
  });

  async function copyBookmarklet(): Promise<void> {
    await navigator.clipboard.writeText(bookmarkletHref.value);
    copied.value = true;
    globalThis.setTimeout(() => {
      copied.value = false;
    }, 1500);
  }
</script>

<template>
  <div class="page-settings">
    <h1 class="page-settings__title">
      {{ t('settings.title') }}
    </h1>
    <AppButton variant="outline" :label="t('settings.theme')" @click="toggleTheme" />
    <AppSelect
      :model-value="locale"
      :options="localeOptions"
      @update:model-value="
        (v) => {
          void setLocale(v as 'en' | 'ru');
        }
      "
    />
    <section class="page-settings__bookmarklet">
      <h2 class="page-settings__subtitle">{{ t('settings.bookmarklet.title') }}</h2>
      <p class="page-settings__hint">{{ t('settings.bookmarklet.description') }}</p>
      <div class="page-settings__bm-row">
        <a class="page-settings__bm-link" :href="bookmarkletHref" @click.prevent>
          {{ t('settings.bookmarklet.button') }}
        </a>
        <AppButton
          variant="outline"
          :label="copied ? t('settings.bookmarklet.copied') : t('settings.bookmarklet.copy')"
          @click="copyBookmarklet"
        />
      </div>
      <p class="page-settings__drag-hint">{{ t('settings.bookmarklet.dragHint') }}</p>
    </section>
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

    &__bookmarklet {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-4);
    }

    &__subtitle {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
    }

    &__hint,
    &__drag-hint {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    &__bm-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    &__bm-link {
      display: inline-flex;
      align-items: center;
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: var(--surface-raised);
      color: var(--text-fg);
      font-weight: var(--fw-medium);
      cursor: grab;
    }
  }
</style>
