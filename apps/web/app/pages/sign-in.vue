<script setup lang="ts">
  import { AppInput, AppField, AppButton } from '@app/ui';
  import { ref, computed } from 'vue';

  import { isValidEmail, isValidPassword } from '~/utils/auth-validation';

  definePageMeta({ middleware: 'guest' });
  const { t } = useI18n();
  const route = useRoute();
  const auth = useAuth();

  function postSignInTarget(): string {
    const r = route.query.redirect;
    return typeof r === 'string' && r.startsWith('/') ? r : '/library';
  }

  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const errorMsg = ref('');
  const formValid = computed(() => isValidEmail(email.value) && isValidPassword(password.value));

  async function onSignIn(): Promise<void> {
    errorMsg.value = '';
    if (!formValid.value) {
      errorMsg.value = t('signIn.errorInvalid');
      return;
    }
    loading.value = true;
    try {
      const result = await auth.signIn.email({ email: email.value, password: password.value });
      if (result.error) {
        const msg = result.error.message?.toLowerCase() ?? '';
        errorMsg.value =
          msg.includes('invalid') || msg.includes('credential') || msg.includes('password')
            ? t('signIn.errorCredentials')
            : t('signIn.errorGeneric');
        return;
      }
      await navigateTo(postSignInTarget());
    } catch {
      errorMsg.value = t('signIn.errorGeneric');
    } finally {
      loading.value = false;
    }
  }
</script>

<template>
  <div class="page-auth" data-testid="page-sign-in">
    <main class="page-auth__card">
      <AuthAppBrand />
      <h1 class="page-auth__title">
        {{ t('signIn.title') }}
      </h1>
      <p class="page-auth__subtitle">
        {{ t('signIn.subtitle') }}
      </p>
      <AuthAppFormError :message="errorMsg" />
      <form class="page-auth__form" novalidate @submit.prevent="onSignIn">
        <AppField :label="t('signIn.email')" required>
          <template #default="slotAttrs">
            <AppInput
              v-bind="slotAttrs"
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="user@example.com"
            />
          </template>
        </AppField>
        <AppField :label="t('signIn.password')" required>
          <template #default="slotAttrs">
            <AppInput
              v-bind="slotAttrs"
              v-model="password"
              type="password"
              autocomplete="current-password"
            />
          </template>
        </AppField>
        <AppButton
          type="submit"
          block
          variant="solid"
          color="primary"
          :loading="loading"
          :disabled="loading || !formValid"
          :label="t('signIn.submit')"
        />
      </form>
      <p class="page-auth__meta">
        {{ t('signIn.noAccount') }}
        <NuxtLink to="/sign-up" class="page-auth__link">
          {{ t('signIn.createAccount') }}
        </NuxtLink>
      </p>
    </main>
  </div>
</template>

<style scoped lang="scss">
  // WHY: auth card width has no spacing-scale token equivalent.
  // REUSED by sign-up.vue — keep this block generic (page-auth, not page-sign-in).
  $card-width: 25rem;

  .page-auth {
    display: flex;
    min-height: 100dvh;
    align-items: center;
    justify-content: center;
    background: var(--surface-page);
    padding: var(--space-6);

    &__card {
      width: 100%;
      max-width: $card-width;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding: var(--space-8);
      background: var(--surface-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
    }

    &__title {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
    }

    &__subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    &__meta {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-align: center;
    }

    &__link {
      color: var(--brand-accent);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
