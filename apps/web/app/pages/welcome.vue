<script setup lang="ts">
  import { AppButton } from '@app/ui';

  definePageMeta({ middleware: 'guest' });
  const { t } = useI18n();

  const features = [
    { key: 'save', titleKey: 'welcome.features.save.title', bodyKey: 'welcome.features.save.body' },
    {
      key: 'reader',
      titleKey: 'welcome.features.reader.title',
      bodyKey: 'welcome.features.reader.body',
    },
    { key: 'sync', titleKey: 'welcome.features.sync.title', bodyKey: 'welcome.features.sync.body' },
  ] as const;

  async function getStarted(): Promise<void> {
    await navigateTo('/sign-up');
  }
  async function signIn(): Promise<void> {
    await navigateTo('/sign-in');
  }
</script>

<template>
  <div class="page-welcome">
    <header class="page-welcome__bar">
      <AuthAppBrand />
    </header>

    <main class="page-welcome__hero">
      <p class="page-welcome__eyebrow">
        {{ t('welcome.eyebrow') }}
      </p>
      <h1 class="page-welcome__title">
        {{ t('welcome.title') }}
      </h1>
      <p class="page-welcome__lead">
        {{ t('welcome.lead') }}
      </p>
      <div class="page-welcome__actions">
        <AppButton size="lg" :label="t('welcome.getStarted')" @click="getStarted" />
        <AppButton variant="link" :label="t('welcome.signIn')" @click="signIn" />
      </div>
    </main>

    <ul class="page-welcome__features">
      <li v-for="f in features" :key="f.key" class="page-feature">
        <h2 class="page-feature__title">
          {{ t(f.titleKey) }}
        </h2>
        <p class="page-feature__body">
          {{ t(f.bodyKey) }}
        </p>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
  $page-welcome-measure: 64rem;
  $page-welcome-glow-size: var(--space-32);
  // Local z-index layers: glow pseudo sits below content
  $z-glow: 0;
  $z-content: 1;

  .page-welcome {
    display: flex;
    flex-direction: column;
    gap: var(--space-20);
    min-height: 100dvh;
    padding: var(--space-6) var(--space-6) var(--space-16);
    background: var(--surface-page);
    color: var(--text-fg);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;

    &__bar {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: $page-welcome-measure;
      margin-inline: auto;
      padding-block: var(--space-2);
    }

    &__hero {
      position: relative;
      width: 100%;
      max-width: $page-welcome-measure;
      margin-inline: auto;
      padding-block: var(--space-16) var(--space-8);

      // accent glow — soft reading-lamp behind the headline
      &::before {
        content: '';
        position: absolute;
        inset-block-start: calc(var(--space-2) * -1);
        inset-inline-start: calc(var(--space-12) * -1);
        inline-size: $page-welcome-glow-size;
        block-size: $page-welcome-glow-size;
        background: radial-gradient(
          circle at center,
          color-mix(in oklab, var(--brand-accent) 24%, transparent),
          transparent 68%
        );
        pointer-events: none;
        z-index: $z-glow;
      }
    }

    &__eyebrow {
      position: relative;
      z-index: $z-content;
      margin: 0 0 var(--space-5);
      font-size: var(--text-sm);
      font-weight: var(--fw-semibold);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--brand-accent);
    }

    &__title {
      position: relative;
      z-index: $z-content;
      max-width: 16ch;
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      font-size: var(--text-6xl);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
      color: var(--text-fg);
      text-wrap: balance;
    }

    &__lead {
      position: relative;
      z-index: $z-content;
      max-width: 44ch;
      margin: var(--space-6) 0 0;
      font-family: var(--font-reading);
      font-size: var(--text-xl);
      line-height: var(--leading-relaxed);
      color: var(--text-secondary);
      text-wrap: pretty;
    }

    &__actions {
      position: relative;
      z-index: $z-content;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-4);
      margin-block-start: var(--space-10);
    }

    &__features {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-10);
      width: 100%;
      max-width: $page-welcome-measure;
      margin: 0 auto;
      padding-block-start: var(--space-10);
      list-style: none;
      border-block-start: thin solid var(--border-default);
    }
  }

  .page-feature {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: var(--fw-medium);
      font-size: var(--text-xl);
      line-height: var(--leading-snug);
      letter-spacing: var(--tracking-tight);
      color: var(--text-fg);
    }

    &__body {
      max-width: 36ch;
      margin: 0;
      font-family: var(--font-reading);
      font-size: var(--text-base);
      line-height: var(--leading-relaxed);
      color: var(--text-secondary);
      text-wrap: pretty;
    }
  }

  @media (max-width: 52rem) {
    .page-welcome__title {
      font-size: var(--text-5xl);
    }

    .page-welcome__features {
      grid-template-columns: 1fr;
      gap: var(--space-8);
    }
  }

  @media (max-width: 34rem) {
    .page-welcome {
      gap: var(--space-12);
    }

    .page-welcome__title {
      font-size: var(--text-4xl);
    }

    .page-welcome__actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
