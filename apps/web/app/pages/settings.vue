<script setup lang="ts">
  import { AppButton, AppSelect } from '@app/ui';
  import { onMounted, ref } from 'vue';

  import { buildBookmarkletHref } from '~/utils/bookmarklet';
  import { tokenRows } from '~/utils/token-view';

  definePageMeta({ middleware: 'auth' });
  const { t, locale, setLocale } = useI18n();
  const colorMode = useColorMode();
  const api = useApi();

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

  // ── Personal access tokens ──────────────────────────────────────────────────

  const tokenName = ref('');
  const tokenCreating = ref(false);
  const tokenError = ref('');
  const newTokenSecret = ref('');
  const newTokenCopied = ref(false);
  const tokenListLoading = ref(false);
  const tokenList = ref<ReturnType<typeof tokenRows>>([]);
  const revokingId = ref<string | null>(null);

  async function fetchTokens(): Promise<void> {
    tokenListLoading.value = true;
    try {
      const res = await api.listTokens();
      tokenList.value = tokenRows(res.tokens, t('settings.tokens.never'));
    } finally {
      tokenListLoading.value = false;
    }
  }

  onMounted(() => {
    void fetchTokens();
  });

  async function createToken(): Promise<void> {
    const name = tokenName.value.trim();
    if (!name) return;
    tokenCreating.value = true;
    tokenError.value = '';
    newTokenSecret.value = '';
    newTokenCopied.value = false;
    try {
      const created = await api.createToken({ name });
      newTokenSecret.value = created.token;
      tokenName.value = '';
      await fetchTokens();
    } catch {
      tokenError.value = t('reader.actionFailed');
    } finally {
      tokenCreating.value = false;
    }
  }

  async function copyNewToken(): Promise<void> {
    await navigator.clipboard.writeText(newTokenSecret.value);
    newTokenCopied.value = true;
    globalThis.setTimeout(() => {
      newTokenCopied.value = false;
    }, 1500);
  }

  async function revokeToken(id: string): Promise<void> {
    revokingId.value = id;
    try {
      await api.revokeToken(id);
      await fetchTokens();
    } finally {
      revokingId.value = null;
    }
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
      <h2 class="page-settings__subtitle">
        {{ t('settings.bookmarklet.title') }}
      </h2>
      <p class="page-settings__hint">
        {{ t('settings.bookmarklet.description') }}
      </p>
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
      <p class="page-settings__drag-hint">
        {{ t('settings.bookmarklet.dragHint') }}
      </p>
    </section>

    <section class="page-settings__tokens">
      <h2 class="page-settings__subtitle">
        {{ t('settings.tokens.title') }}
      </h2>
      <p class="page-settings__hint">
        {{ t('settings.tokens.description') }}
      </p>

      <div class="page-settings__tokens-create">
        <UInput
          v-model="tokenName"
          class="page-settings__tokens-input"
          :placeholder="t('settings.tokens.namePlaceholder')"
          :aria-label="t('settings.tokens.name')"
          @keydown.enter="
            () => {
              void createToken();
            }
          "
        />
        <AppButton
          variant="solid"
          :label="t('settings.tokens.create')"
          :loading="tokenCreating"
          @click="
            () => {
              void createToken();
            }
          "
        />
      </div>

      <p v-if="tokenError" class="page-settings__tokens-error">
        {{ tokenError }}
      </p>

      <div v-if="newTokenSecret" class="page-settings__tokens-once">
        <p class="page-settings__tokens-once-hint">
          {{ t('settings.tokens.copyOnce') }}
        </p>
        <div class="page-settings__tokens-once-row">
          <code class="page-settings__tokens-secret">{{ newTokenSecret }}</code>
          <AppButton
            variant="outline"
            :label="newTokenCopied ? t('settings.tokens.copied') : t('settings.tokens.copy')"
            @click="
              () => {
                void copyNewToken();
              }
            "
          />
        </div>
      </div>

      <div v-if="tokenListLoading" class="page-settings__tokens-loading">
        <span class="page-settings__tokens-loading-text">…</span>
      </div>

      <p v-else-if="tokenList.length === 0" class="page-settings__tokens-empty">
        {{ t('settings.tokens.empty') }}
      </p>

      <ul v-else class="page-settings__tokens-list">
        <li v-for="row in tokenList" :key="row.id" class="page-settings__tokens-item">
          <div class="page-settings__tokens-item-info">
            <span class="page-settings__tokens-item-name">{{ row.name }}</span>
            <span class="page-settings__tokens-item-prefix">{{ row.prefix }}</span>
            <span class="page-settings__tokens-item-meta">
              {{ t('settings.tokens.lastUsed') }}: {{ row.lastUsed }}
            </span>
            <span class="page-settings__tokens-item-meta">
              {{ t('settings.tokens.created') }}: {{ row.createdAt }}
            </span>
          </div>
          <AppButton
            variant="outline"
            :label="t('settings.tokens.revoke')"
            :loading="revokingId === row.id"
            @click="
              () => {
                void revokeToken(row.id);
              }
            "
          />
        </li>
      </ul>
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

    // ── tokens section ──────────────────────────────────────────────────────

    &__tokens {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-top: var(--space-4);
    }

    &__tokens-create {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    &__tokens-input {
      flex: 1;
    }

    &__tokens-error {
      font-size: var(--text-sm);
      color: var(--status-error-fg);
    }

    &__tokens-once {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-3);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: var(--surface-raised);
    }

    &__tokens-once-hint {
      font-size: var(--text-sm);
      font-weight: var(--fw-medium);
      color: var(--text-secondary);
    }

    &__tokens-once-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    &__tokens-secret {
      flex: 1;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: var(--text-xs);
      word-break: break-all;
      color: var(--text-fg);
    }

    &__tokens-loading {
      display: flex;
      justify-content: center;
      padding: var(--space-4);
    }

    &__tokens-loading-text {
      color: var(--text-secondary);
    }

    &__tokens-empty {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-align: center;
      padding: var(--space-4) 0;
    }

    &__tokens-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    &__tokens-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: var(--surface-raised);
    }

    &__tokens-item-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      min-width: 0;
    }

    &__tokens-item-name {
      font-weight: var(--fw-medium);
      color: var(--text-fg);
      font-size: var(--text-sm);
    }

    &__tokens-item-prefix {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    &__tokens-item-meta {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }
</style>
