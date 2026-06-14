<script setup lang="ts">
  import { AppButton } from '@app/ui';
  import { onMounted, ref } from 'vue';

  import { resolveSaveAction } from '~/utils/save-action';

  // No 'auth' middleware: this page self-guards (redirects to sign-in itself).
  definePageMeta({ layout: false });

  const { t } = useI18n();
  const route = useRoute();
  const api = useApi();
  const auth = useAuth();

  type View = 'pending' | 'saving' | 'saved' | 'failed' | 'bad';
  const view = ref<View>('pending');

  let pendingUrl = '';

  async function doSave(url: string): Promise<void> {
    view.value = 'saving';
    try {
      await api.saveItem({ url });
      view.value = 'saved';
      // Popup: close shortly after success. No-op (and harmless) in a normal tab.
      globalThis.setTimeout(() => {
        globalThis.window.close();
      }, 1200);
    } catch {
      view.value = 'failed';
    }
  }

  function retry(): void {
    if (pendingUrl) void doSave(pendingUrl);
  }

  onMounted(async () => {
    const rawUrl = route.query.url;
    const url = typeof rawUrl === 'string' ? rawUrl : null;
    const session = await auth.getSession();
    const authed = Boolean((session as { data?: { user?: unknown } } | null)?.data?.user);

    const action = resolveSaveAction({ url, authed, fullPath: route.fullPath });
    if (action.kind === 'bad') {
      view.value = 'bad';
      return;
    }
    if (action.kind === 'redirect') {
      void navigateTo(action.to);
      return;
    }
    pendingUrl = action.url;
    await doSave(action.url);
  });
</script>

<template>
  <div class="page-save">
    <div class="page-save__card">
      <p v-if="view === 'saving' || view === 'pending'" class="page-save__status">
        {{ t('save.saving') }}
      </p>

      <template v-else-if="view === 'saved'">
        <p class="page-save__status page-save__status--ok">{{ t('save.saved') }}</p>
        <NuxtLink class="page-save__link" to="/library">{{ t('save.viewInLibrary') }}</NuxtLink>
      </template>

      <template v-else-if="view === 'failed'">
        <p class="page-save__status page-save__status--err">{{ t('save.failed') }}</p>
        <AppButton variant="solid" color="primary" :label="t('save.retry')" @click="retry" />
        <NuxtLink class="page-save__link" to="/library">{{ t('save.viewInLibrary') }}</NuxtLink>
      </template>

      <template v-else>
        <p class="page-save__status page-save__status--err">{{ t('save.badUrl') }}</p>
        <NuxtLink class="page-save__link" to="/library">{{ t('save.viewInLibrary') }}</NuxtLink>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .page-save {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--space-6);
    background: var(--surface-page);

    &__card {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      align-items: center;
      text-align: center;
      max-width: 22rem;
    }

    &__status {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      color: var(--text-secondary);

      &--ok {
        color: var(--text-fg);
      }

      &--err {
        color: var(--text-fg);
      }
    }

    &__link {
      color: var(--brand-accent);
      font-size: var(--text-sm);
    }
  }
</style>
