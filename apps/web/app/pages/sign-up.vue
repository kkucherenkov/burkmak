<script setup lang="ts">
  import { AppInput, AppField, AppButton } from '@app/ui';
  import { ref, computed } from 'vue';

  import { isValidEmail, isValidPassword } from '~/utils/auth-validation';
  import { passwordStrength } from '~/utils/password-strength';

  definePageMeta({ middleware: 'guest' });
  const { t } = useI18n();
  const auth = useAuth();

  const name = ref('');
  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const errorMsg = ref('');

  const strength = computed(() => passwordStrength(password.value));
  const strengthLabel = computed(() => t(`signUp.strength.${String(strength.value.score)}`));
  const formValid = computed(
    () =>
      name.value.trim().length > 0 && isValidEmail(email.value) && isValidPassword(password.value),
  );

  async function onSignUp(): Promise<void> {
    errorMsg.value = '';
    if (!formValid.value) {
      errorMsg.value = t('signUp.errorInvalid');
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
          msg.includes('exist') || msg.includes('taken')
            ? t('signUp.errorEmailTaken')
            : t('signUp.errorGeneric');
        return;
      }
      await navigateTo('/library');
    } catch {
      errorMsg.value = t('signUp.errorGeneric');
    } finally {
      loading.value = false;
    }
  }
</script>

<template>
  <div class="page-auth" data-testid="page-sign-up">
    <main class="page-auth__card">
      <AuthAppBrand />
      <h1 class="page-auth__title">
        {{ t('signUp.title') }}
      </h1>
      <p class="page-auth__subtitle">
        {{ t('signUp.subtitle') }}
      </p>
      <AuthAppFormError :message="errorMsg" />
      <form class="page-auth__form" novalidate @submit.prevent="onSignUp">
        <AppField :label="t('signUp.name')" required>
          <template #default="slotAttrs">
            <AppInput v-bind="slotAttrs" v-model="name" type="text" autocomplete="name" />
          </template>
        </AppField>
        <AppField :label="t('signUp.email')" required>
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
        <AppField :label="t('signUp.password')" :help="t('signUp.passwordHint')" required>
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
          :label="t('signUp.submit')"
        />
      </form>
      <p class="page-auth__meta">
        {{ t('signUp.hasAccount') }}
        <NuxtLink to="/sign-in" class="page-auth__link">
          {{ t('signUp.signIn') }}
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
