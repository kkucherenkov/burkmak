<script setup lang="ts">
  // welcome.vue — burkmak first-run landing (WELCOME screen).
  // Build reference for @app/ui. Styled ONLY through the canonical token
  // variables that tokens.preview.css publishes (--brand-accent, --surface-page,
  // --text-fg, --radius-*, --space-*, --dur-*, …). No hex / px / ms literals,
  // no Tailwind, no inline styles, no !important.

  withDefaults(defineProps<{ theme?: 'light' | 'dark' }>(), { theme: 'light' });

  const emit = defineEmits<{
    (e: 'get-started'): void;
    (e: 'sign-in'): void;
  }>();

  const features = [
    {
      key: 'save',
      title: 'Save anything',
      body: 'Paste a link or share from any app. burkmak grabs the full article and keeps it — even if the original goes dark.',
    },
    {
      key: 'reader',
      title: 'Clean reader view',
      body: 'No ads, no clutter. Just Literata, generous margins, and the highlights you leave behind.',
    },
    {
      key: 'sync',
      title: 'Sync to Kobo & export to Obsidian',
      body: 'Send a piece to your e-reader for the evening, then push your notes straight into your vault.',
    },
  ];
</script>

<template>
  <section class="app-welcome" :data-theme="theme">
    <header class="app-welcome__bar">
      <a class="app-welcome__wordmark" href="#" aria-label="burkmak — home">burkmak</a>
    </header>

    <main class="app-welcome__hero">
      <p class="app-welcome__eyebrow">Read-it-later, kept warm</p>
      <h1 class="app-welcome__title">A quiet home for everything you mean to read.</h1>
      <p class="app-welcome__lead">
        Save anything from the web, read it clean, and keep your library truly yours.
      </p>

      <div class="app-welcome__actions">
        <!-- @app/ui: AppButton -->
        <button class="app-button app-button--primary" type="button" @click="emit('get-started')">
          Get started
        </button>
        <!-- @app/ui: AppButton (link variant) -->
        <button class="app-button app-button--link" type="button" @click="emit('sign-in')">
          Sign in
        </button>
      </div>
    </main>

    <ul class="app-welcome__features">
      <li v-for="f in features" :key="f.key" class="app-feature">
        <h2 class="app-feature__title">{{ f.title }}</h2>
        <p class="app-feature__body">{{ f.body }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
  .app-welcome {
    --app-welcome-measure: 64rem;

    display: flex;
    flex-direction: column;
    gap: var(--space-20);
    min-height: 100vh;
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
      justify-content: space-between;
      width: 100%;
      max-width: var(--app-welcome-measure);
      margin-inline: auto;
      padding-block: var(--space-2);
    }

    &__wordmark {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--fw-semibold);
      letter-spacing: var(--tracking-tight);
      color: var(--text-fg);
      text-decoration: none;
    }

    &__hero {
      position: relative;
      width: 100%;
      max-width: var(--app-welcome-measure);
      margin-inline: auto;
      padding-block: var(--space-16) var(--space-8);
    }

    // the single decisive flourish: a soft reading-lamp glow behind the headline
    &__hero::before {
      content: '';
      position: absolute;
      inset-block-start: calc(var(--space-2) * -1);
      inset-inline-start: calc(var(--space-12) * -1);
      inline-size: var(--space-24);
      block-size: var(--space-24);
      background: radial-gradient(
        circle at center,
        color-mix(in oklab, var(--brand-accent) 24%, transparent),
        transparent 68%
      );
      pointer-events: none;
      z-index: 0;
    }

    &__eyebrow {
      position: relative;
      z-index: 1;
      margin: 0 0 var(--space-5);
      font-size: var(--text-sm);
      font-weight: var(--fw-semibold);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--brand-accent);
    }

    &__title {
      position: relative;
      z-index: 1;
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
      z-index: 1;
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
      z-index: 1;
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
      max-width: var(--app-welcome-measure);
      margin: 0 auto;
      padding-block-start: var(--space-10);
      list-style: none;
      border-block-start: thin solid var(--border-default);
    }
  }

  .app-feature {
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

  // @app/ui: AppButton
  .app-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: thin solid transparent;
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-6);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--fw-semibold);
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-normal);
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--dur-base) var(--ease-default),
      border-color var(--dur-base) var(--ease-default),
      color var(--dur-base) var(--ease-default),
      box-shadow var(--dur-fast) var(--ease-default);

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 var(--space-1) color-mix(in oklab, var(--border-focus) 42%, transparent);
    }

    &--primary {
      background: var(--brand-accent);
      border-color: var(--brand-accent);
      color: var(--brand-accent-fg);
      box-shadow: var(--shadow-sm);

      &:hover {
        background: var(--brand-accent-hover);
        border-color: var(--brand-accent-hover);
      }

      &:active {
        background: var(--brand-accent-active);
        border-color: var(--brand-accent-active);
        box-shadow: none;
      }

      &:focus-visible {
        box-shadow:
          var(--shadow-sm),
          0 0 0 var(--space-1) color-mix(in oklab, var(--border-focus) 48%, transparent);
      }

      &:disabled {
        background: var(--text-disabled);
        border-color: var(--text-disabled);
        color: var(--surface-page);
        box-shadow: none;
        cursor: not-allowed;
      }
    }

    &--link {
      padding-inline: var(--space-2);
      background: transparent;
      border-color: transparent;
      color: var(--text-link);

      &:hover {
        color: var(--brand-accent-hover);
        text-decoration: underline;
        text-underline-offset: var(--space-1);
      }

      &:active {
        color: var(--brand-accent-active);
      }

      &:disabled {
        color: var(--text-disabled);
        cursor: not-allowed;
      }
    }
  }

  @media (max-width: 52rem) {
    .app-welcome__title {
      font-size: var(--text-5xl);
    }

    .app-welcome__features {
      grid-template-columns: 1fr;
      gap: var(--space-8);
    }
  }

  @media (max-width: 34rem) {
    .app-welcome {
      gap: var(--space-12);
    }

    .app-welcome__title {
      font-size: var(--text-4xl);
    }

    .app-welcome__actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
