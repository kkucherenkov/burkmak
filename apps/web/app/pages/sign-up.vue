<script setup lang="ts">
  import { AppInput, AppField, AppButton } from '@app/ui';
  import { ref, computed } from 'vue';

  import { isValidEmail, isValidPassword } from '~/utils/auth-validation';
  import { passwordStrength } from '~/utils/password-strength';

  definePageMeta({ middleware: 'guest' });
  const { t } = useI18n({ useScope: 'local' });
  const auth = useAuth();

  const name = ref('');
  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const errorMsg = ref('');

  const strength = computed(() => passwordStrength(password.value));
  const strengthLabel = computed(() => t(`strength.${String(strength.value.score)}`));
  const formValid = computed(
    () =>
      name.value.trim().length > 0 && isValidEmail(email.value) && isValidPassword(password.value),
  );

  async function onSignUp(): Promise<void> {
    errorMsg.value = '';
    if (!formValid.value) {
      errorMsg.value = t('errorInvalid');
      return;
    }
    loading.value = true;
    try {
      const result = await auth.signUp.email({
        name: name.value.trim(),
        email: email.value,
        password: password.value,
      });
      if (result.error) {
        const msg = result.error.message?.toLowerCase() ?? '';
        errorMsg.value =
          msg.includes('exist') || msg.includes('taken') ? t('errorEmailTaken') : t('errorGeneric');
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
    "title": "Create your library",
    "subtitle": "Start saving in seconds",
    "name": "Name",
    "email": "Email",
    "password": "Password",
    "passwordHint": "8+ characters, with a number or symbol.",
    "submit": "Create account",
    "hasAccount": "Already have a library?",
    "signIn": "Sign in",
    "errorInvalid": "Fill every field; password needs 8+ characters.",
    "errorEmailTaken": "That email is already registered.",
    "errorGeneric": "Something went wrong. Please try again.",
    "strength": {
      "0": "Too weak",
      "1": "Too weak",
      "2": "Getting there",
      "3": "Good",
      "4": "Strong"
    }
  },
  "ru": {
    "title": "Создайте библиотеку",
    "subtitle": "Сохраняйте за секунды",
    "name": "Имя",
    "email": "Эл. почта",
    "password": "Пароль",
    "passwordHint": "8+ символов, с цифрой или символом.",
    "submit": "Создать аккаунт",
    "hasAccount": "Уже есть библиотека?",
    "signIn": "Войти",
    "errorInvalid": "Заполните все поля; пароль от 8 символов.",
    "errorEmailTaken": "Этот email уже зарегистрирован.",
    "errorGeneric": "Что-то пошло не так. Попробуйте ещё раз.",
    "strength": {
      "0": "Слишком слабый",
      "1": "Слишком слабый",
      "2": "Сойдёт",
      "3": "Хороший",
      "4": "Надёжный"
    }
  }
}
</i18n>

<template>
  <div class="page-auth" data-testid="page-sign-up">
    <main class="page-auth__card">
      <AuthAppBrand />
      <h1 class="page-auth__title">
        {{ t('title') }}
      </h1>
      <p class="page-auth__subtitle">
        {{ t('subtitle') }}
      </p>
      <AuthAppFormError :message="errorMsg" />
      <form class="page-auth__form" novalidate @submit.prevent="onSignUp">
        <AppField :label="t('name')" required>
          <template #default="slotAttrs">
            <AppInput v-bind="slotAttrs" v-model="name" type="text" autocomplete="name" />
          </template>
        </AppField>
        <AppField :label="t('email')" required>
          <template #default="slotAttrs">
            <AppInput
              v-bind="slotAttrs"
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
            />
          </template>
        </AppField>
        <AppField :label="t('password')" :help="t('passwordHint')" required>
          <template #default="slotAttrs">
            <AppInput
              v-bind="slotAttrs"
              v-model="password"
              type="password"
              autocomplete="new-password"
            />
          </template>
        </AppField>
        <AuthAppStrength v-if="password" :score="strength.score" :label="strengthLabel" />
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
        {{ t('hasAccount') }}
        <NuxtLink to="/sign-in" class="page-auth__link">
          {{ t('signIn') }}
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
