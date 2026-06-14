<script setup lang="ts">
  import { computed } from 'vue';

  const { t } = useI18n();
  const route = useRoute();
  const auth = useAuth();
  const session = auth.useSession();

  const isAuthenticated = computed(() => !!session.value.data);

  const NO_PAD_ROUTES = new Set(['/sign-in', '/sign-up']);
  const isNoPad = computed(() => NO_PAD_ROUTES.has(route.path));

  async function onSignOut(): Promise<void> {
    await auth.signOut();
    await navigateTo('/sign-in');
  }
</script>

<template>
  <div class="default-layout">
    <header class="default-layout__header">
      <nav class="default-layout__nav" :aria-label="t('nav.appName')">
        <NuxtLink to="/" class="default-layout__brand">
          {{ t('nav.appName') }}
        </NuxtLink>
        <ul class="default-layout__nav-list">
          <li class="default-layout__nav-item">
            <NuxtLink
              to="/"
              class="default-layout__nav-link"
              :class="{ 'default-layout__nav-link--active': route.path === '/' }"
            >
              {{ t('nav.navHome') }}
            </NuxtLink>
          </li>
          <li v-if="!isAuthenticated" class="default-layout__nav-item">
            <NuxtLink
              to="/sign-in"
              class="default-layout__nav-link"
              :class="{ 'default-layout__nav-link--active': route.path === '/sign-in' }"
            >
              {{ t('nav.navLogin') }}
            </NuxtLink>
          </li>
          <li v-if="isAuthenticated" class="default-layout__nav-item">
            <button type="button" class="default-layout__nav-link" @click="onSignOut">
              {{ t('nav.navSignOut') }}
            </button>
          </li>
        </ul>
      </nav>
    </header>

    <main class="default-layout__main" :class="{ 'default-layout__main--no-pad': isNoPad }">
      <slot />
    </main>

    <footer class="default-layout__footer">
      <span class="default-layout__footer-copy">&copy; 2026 {{ t('nav.appName') }}</span>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
  // WHY: chrome layout dimensions with no spacing-scale token equivalent.
  $nav-max-width: 1280px;
  $nav-height: 56px;

  .default-layout {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--surface-page);
    color: var(--text-fg);

    &__header {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      background: var(--surface-surface);
      border-bottom: 1px solid var(--border-default);
    }

    &__nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: $nav-max-width;
      margin: 0 auto;
      padding: 0 var(--space-8);
      height: $nav-height;
    }

    &__brand {
      font-family: var(--font-sans);
      font-size: var(--text-lg);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
      text-decoration: none;
      letter-spacing: var(--tracking-tight);

      &:hover {
        color: var(--brand-accent);
      }
    }

    &__nav-list {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    &__nav-item {
      display: flex;
    }

    &__nav-link {
      display: inline-flex;
      align-items: center;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--fw-medium);
      color: var(--text-secondary);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      transition:
        color var(--dur-fast) var(--ease),
        background var(--dur-fast) var(--ease);

      &:hover {
        color: var(--text-fg);
        background: var(--surface-surface);
      }

      &:focus-visible {
        outline: none;
        box-shadow: var(--shadow-focus);
      }

      &--active {
        color: var(--brand-accent);
        background: var(--brand-accent-subtle);

        &:hover {
          color: var(--brand-accent-hover);
          background: var(--brand-accent-subtle);
        }
      }
    }

    &__main {
      flex: 1;
      padding: var(--space-8);

      &--no-pad {
        padding: 0;
      }
    }

    &__footer {
      border-top: 1px solid var(--border-default);
      padding: var(--space-6) var(--space-8);
      text-align: center;
    }

    &__footer-copy {
      font-size: var(--text-xs);
      color: var(--text-disabled);
    }
  }
</style>
