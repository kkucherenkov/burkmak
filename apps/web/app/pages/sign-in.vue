<script setup lang="ts">
  import { AppInput, AppField, AppButton } from '@app/ui';
  import { ref, computed } from 'vue';

  import { isValidEmail, isValidPassword } from '~/utils/auth-validation';

  definePageMeta({ middleware: 'guest' });
  const { t } = useI18n({ useScope: 'local' });
  const auth = useAuth();

  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const errorMsg = ref('');
  const formValid = computed(() => isValidEmail(email.value) && isValidPassword(password.value));

  async function onSignIn(): Promise<void> {
    errorMsg.value = '';
    if (!formValid.value) {
      errorMsg.value = t('errorInvalid');
      return;
    }
    loading.value = true;
    try {
      const result = await auth.signIn.email({ email: email.value, password: password.value });
      if (result.error) {
        const msg = result.error.message?.toLowerCase() ?? '';
        errorMsg.value =
          msg.includes('invalid') || msg.includes('credential') || msg.includes('password')
            ? t('errorCredentials')
            : t('errorGeneric');
        return;
      }
      await navigateTo('/library');
    } catch {
      errorMsg.value = t('errorGeneric');
    } finally {
      loading.value = false;
    }
  }
</script>

<i18n lang="json">
{
  "en": {
    "title": "Welcome back",
    "subtitle": "Sign in to your library",
    "email": "Email",
    "password": "Password",
    "submit": "Sign in",
    "noAccount": "New to burkmak?",
    "createAccount": "Create an account",
    "errorInvalid": "Enter a valid email and an 8+ character password.",
    "errorCredentials": "Wrong email or password.",
    "errorGeneric": "Something went wrong. Please try again."
  },
  "ru": {
    "title": "С возвращением",
    "subtitle": "Войдите в свою библиотеку",
    "email": "Эл. почта",
    "password": "Пароль",
    "submit": "Войти",
    "noAccount": "Впервые в burkmak?",
    "createAccount": "Создать аккаунт",
    "errorInvalid": "Введите корректный email и пароль от 8 символов.",
    "errorCredentials": "Неверный email или пароль.",
    "errorGeneric": "Что-то пошло не так. Попробуйте ещё раз."
  }
}
</i18n>

<template>
  <div class="page-auth" data-testid="page-sign-in">
    <main class="page-auth__card">
      <AuthAppBrand />
      <h1 class="page-auth__title">
        {{ t('title') }}
      </h1>
      <p class="page-auth__subtitle">
        {{ t('subtitle') }}
      </p>
      <AuthAppFormError :message="errorMsg" />
      <form class="page-auth__form" novalidate @submit.prevent="onSignIn">
        <AppField :label="t('email')" required>
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
        <AppField :label="t('password')" required>
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
          :label="t('submit')"
        />
      </form>
      <p class="page-auth__meta">
        {{ t('noAccount') }}
        <NuxtLink to="/sign-up" class="page-auth__link">
          {{ t('createAccount') }}
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
