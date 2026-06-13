<script setup lang="ts">
/**
 * burkmak — Sign up (create-account screen).
 *
 * Near drop-in reference for `@app/ui`. Self-contained: no imports beyond Vue.
 * Styles ONLY through the canonical token contract (tokens.preview.css) —
 * --brand-accent, --surface-page, --text-fg, --radius-*, --space-*, --dur-*, …
 * The component defines NO token values; the host app supplies them and the
 * `theme` prop sets data-theme so the right light/dark set cascades in.
 *
 * Markup stands in for these primitives (extract by root class + comment):
 *   app-card · app-brand · app-field · app-input · app-strength · app-button ·
 *   app-form-error
 *
 * Every state is reachable by interaction: default → focus-visible (tab into a
 * field) → field validation error (submit empty / weak password) → submit
 * loading (valid input) → form-level error banner (an email containing "taken")
 * → success. The password-strength meter updates live as you type. Sign-up has
 * no backend here: a `taken@…` address is rejected so the form-error banner is
 * reviewable; anything else creates the account.
 */
import { computed, ref } from 'vue'

withDefaults(defineProps<{ theme?: 'light' | 'dark' }>(), { theme: 'light' })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<{ name?: string; email?: string; password?: string }>({})
const formError = ref<string | null>(null)
const loading = ref(false)
const done = ref(false)

/**
 * Cheap client-side strength heuristic (0–4). No dictionary lookup — just the
 * shape of the input. The real app would defer to zxcvbn server-side; this is
 * enough to drive the meter and gate obviously weak passwords.
 */
function scorePassword(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s += 1
  if (pw.length >= 12) s += 1
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1
  if (/\d/.test(pw)) s += 1
  if (/[^A-Za-z0-9]/.test(pw)) s += 1
  return Math.min(s, 4)
}

const strength = computed(() => {
  const pw = password.value
  const score = scorePassword(pw)
  if (!pw) return { score: 0, label: '', tone: 'idle' as const }
  if (score <= 1) return { score, label: 'Too weak', tone: 'error' as const }
  if (score === 2) return { score, label: 'Getting there', tone: 'warning' as const }
  if (score === 3) return { score, label: 'Good', tone: 'info' as const }
  return { score: 4, label: 'Strong', tone: 'success' as const }
})

/**
 * Stubbed sign-up — no backend in the mock. Resolves for any address except one
 * containing "taken", which rejects on purpose so the form-error banner and the
 * loading state both stay reviewable without a server.
 */
function signUpRequest(addr: string): Promise<void> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (addr.trim().toLowerCase().includes('taken')) {
        reject(new Error('That email already has a library — try signing in.'))
      } else {
        resolve()
      }
    }, 1200)
  })
}

async function onSubmit() {
  formError.value = null

  const next: { name?: string; email?: string; password?: string } = {}
  if (!name.value.trim()) next.name = 'Tell us what to call you.'
  if (!email.value.trim()) next.email = 'Enter your email.'
  else if (!EMAIL_RE.test(email.value.trim())) next.email = 'That doesn’t look like an email.'
  if (!password.value) next.password = 'Create a password.'
  else if (scorePassword(password.value) <= 1) {
    next.password = 'Too easy to guess — use 8+ characters with a number or symbol.'
  }
  errors.value = next
  if (Object.keys(next).length > 0) return

  loading.value = true
  try {
    await signUpRequest(email.value)
    done.value = true
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Something went wrong. Try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app-auth" :data-theme="theme">
    <!-- @app/ui: AppCard -->
    <main class="app-card app-auth__card" aria-labelledby="signup-title">
      <header class="app-auth__top">
        <!-- @app/ui: AppBrand -->
        <span class="app-brand">
          <span class="app-brand__mark" aria-hidden="true">b</span>
          <span class="app-brand__word">burkmak</span>
        </span>
      </header>

      <div class="app-auth__head">
        <h1 id="signup-title" class="app-auth__title">Create your library</h1>
        <p class="app-auth__subtitle">Save your first article in under a minute — it’s yours to keep.</p>
      </div>

      <div v-if="done" class="app-auth__success" role="status">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span>Library created — opening your reading room…</span>
      </div>

      <template v-else>
        <!-- @app/ui: AppFormError -->
        <div v-if="formError" class="app-form-error" role="alert">
          <svg class="app-form-error__icon" viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" />
          </svg>
          <span>{{ formError }}</span>
        </div>

        <form class="app-form" novalidate @submit.prevent="onSubmit">
          <!-- @app/ui: AppField -->
          <div class="app-field">
            <label class="app-field__label" for="signup-name">Name</label>
            <!-- @app/ui: AppInput -->
            <input
              id="signup-name"
              v-model="name"
              class="app-input"
              type="text"
              name="name"
              autocomplete="name"
              placeholder="Ada Lovelace"
              :aria-invalid="errors.name ? 'true' : undefined"
              :aria-describedby="errors.name ? 'signup-name-error' : undefined"
              :disabled="loading"
            />
            <p v-if="errors.name" id="signup-name-error" class="app-field__error" role="alert">
              <span class="app-field__error-dot" aria-hidden="true" />{{ errors.name }}
            </p>
          </div>

          <!-- @app/ui: AppField -->
          <div class="app-field">
            <label class="app-field__label" for="signup-email">Email</label>
            <!-- @app/ui: AppInput -->
            <input
              id="signup-email"
              v-model="email"
              class="app-input"
              type="email"
              name="email"
              autocomplete="email"
              inputmode="email"
              placeholder="you@example.com"
              :aria-invalid="errors.email ? 'true' : undefined"
              :aria-describedby="errors.email ? 'signup-email-error' : undefined"
              :disabled="loading"
            />
            <p v-if="errors.email" id="signup-email-error" class="app-field__error" role="alert">
              <span class="app-field__error-dot" aria-hidden="true" />{{ errors.email }}
            </p>
          </div>

          <!-- @app/ui: AppField -->
          <div class="app-field">
            <label class="app-field__label" for="signup-password">Password</label>
            <div class="app-input-wrap">
              <!-- @app/ui: AppInput -->
              <input
                id="signup-password"
                v-model="password"
                class="app-input app-input--affix"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="new-password"
                placeholder="At least 8 characters"
                :aria-invalid="errors.password ? 'true' : undefined"
                :aria-describedby="errors.password ? 'signup-password-error' : 'signup-password-hint'"
                :disabled="loading"
              />
              <button
                type="button"
                class="app-input-affix"
                :aria-pressed="showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :disabled="loading"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none"
                  stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" /><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c5 0 9 4.5 9 7a12 12 0 0 1-2.2 3" />
                  <path d="M6.3 6.3C3.9 7.8 2 10.2 2 12c0 2.5 4 7 10 7a9.8 9.8 0 0 0 4.2-.9" />
                  <path d="M9.5 9.5a3.5 3.5 0 0 0 5 5" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none"
                  stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <!-- @app/ui: AppStrength (password meter) -->
            <div v-if="password" class="app-strength" :data-tone="strength.tone">
              <div class="app-strength__track" aria-hidden="true">
                <span
                  v-for="i in 4"
                  :key="i"
                  class="app-strength__seg"
                  :class="{ 'is-on': i <= strength.score }"
                />
              </div>
              <p class="app-strength__label" aria-live="polite">{{ strength.label }} password</p>
            </div>
            <p v-else id="signup-password-hint" class="app-field__hint">8+ characters, with a number or symbol.</p>

            <p v-if="errors.password" id="signup-password-error" class="app-field__error" role="alert">
              <span class="app-field__error-dot" aria-hidden="true" />{{ errors.password }}
            </p>
          </div>

          <p class="app-auth__terms">
            By creating an account you agree to burkmak’s
            <a href="#/terms">Terms</a> and <a href="#/privacy">Privacy</a>.
          </p>

          <!-- @app/ui: AppButton -->
          <button class="app-button" type="submit" :aria-busy="loading || undefined" :disabled="loading">
            <span v-if="loading" class="app-spinner" aria-hidden="true" />
            <span>{{ loading ? 'Creating your library…' : 'Create account' }}</span>
          </button>
        </form>

        <p class="app-auth__meta">
          Already have a library? <a href="#/sign-in">Sign in</a>
        </p>
      </template>
    </main>
  </div>
</template>

<style scoped lang="scss">
/* Tokens come from the global contract (tokens.preview.css). This component
 * defines none — it only consumes canonical vars. The sole raw px are 1px
 * hairline borders, 3px focus-ring spreads, and the 2px spinner stroke (no
 * border-width token exists in the contract) — matching sign-in.vue exactly. */

.app-auth {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: clamp(var(--space-5), 6vw, var(--space-16));
  background: var(--surface-page);
  color: var(--text-fg);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}

/* ----------------------------------------------------------- AppCard */
.app-card {
  width: min(100%, 26rem);
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  padding: clamp(var(--space-8), 6vw, var(--space-10));
}

.app-auth__top {
  margin-bottom: var(--space-6);
}

/* ---------------------------------------------------------- AppBrand */
.app-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-weight: var(--fw-semibold);
  font-size: var(--text-lg);
  letter-spacing: var(--tracking-tight);
  color: var(--text-fg);

  &__mark {
    display: grid;
    place-items: center;
    width: var(--space-6);
    height: var(--space-6);
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: var(--fw-bold);
    color: var(--brand-accent-fg);
    background: var(--brand-accent);
    border-radius: var(--radius-pill);
  }
}

.app-auth__head {
  display: grid;
  gap: var(--space-2);
  margin-bottom: var(--space-7);
}

.app-auth__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--fw-semibold);
  font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl));
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-fg);
  text-wrap: balance;
}

.app-auth__subtitle {
  margin: 0;
  font-size: var(--text-md);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

/* ----------------------------------------------------------- AppForm */
.app-form {
  display: grid;
  gap: var(--space-5);
}

.app-field {
  display: grid;
  gap: var(--space-2);

  &__label {
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-fg);
  }

  &__hint {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  &__error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    font-size: var(--text-sm);
    color: var(--status-error-fg);
  }

  &__error-dot {
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: var(--radius-pill);
    background: currentColor;
  }
}

/* ---------------------------------------------------------- AppInput */
.app-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.app-input {
  width: 100%;
  font: inherit;
  font-size: var(--text-md);
  color: var(--text-fg);
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  transition: border-color var(--dur-base) var(--ease-standard),
    box-shadow var(--dur-base) var(--ease-standard);

  &::placeholder {
    color: var(--text-tertiary);
  }

  &--affix {
    padding-inline-end: var(--space-10);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
  }

  &:disabled {
    color: var(--text-disabled);
    background: var(--surface-surface);
    cursor: not-allowed;
  }

  &[aria-invalid='true'] {
    border-color: var(--status-error-fg);

    &:focus-visible {
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--status-error-fg) 30%, transparent);
    }
  }
}

.app-input-affix {
  position: absolute;
  inset-inline-end: var(--space-2);
  display: grid;
  place-items: center;
  padding: var(--space-1);
  color: var(--text-tertiary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard);

  &:hover {
    color: var(--text-secondary);
  }

  &:focus-visible {
    outline: none;
    color: var(--text-fg);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

/* ------------------------------------------------------- AppStrength */
.app-strength {
  display: grid;
  gap: var(--space-2);

  &__track {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-1);
  }

  &__seg {
    height: var(--space-1);
    border-radius: var(--radius-pill);
    background: var(--border-default);
    transition: background var(--dur-base) var(--ease-standard);

    &.is-on {
      background: var(--text-tertiary);
    }
  }

  &__label {
    margin: 0;
    font-size: var(--text-xs);
    font-weight: var(--fw-medium);
    letter-spacing: var(--tracking-wide);
    color: var(--text-tertiary);
  }

  &[data-tone='error'] {
    .app-strength__seg.is-on { background: var(--status-error-fg); }
    .app-strength__label { color: var(--status-error-fg); }
  }
  &[data-tone='warning'] {
    .app-strength__seg.is-on { background: var(--status-warning-fg); }
    .app-strength__label { color: var(--status-warning-fg); }
  }
  &[data-tone='info'] {
    .app-strength__seg.is-on { background: var(--status-info-fg); }
    .app-strength__label { color: var(--status-info-fg); }
  }
  &[data-tone='success'] {
    .app-strength__seg.is-on { background: var(--status-success-fg); }
    .app-strength__label { color: var(--status-success-fg); }
  }
}

/* ----------------------------------------------------------- AppTerms */
.app-auth__terms {
  margin: 0;
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
  color: var(--text-tertiary);

  a {
    color: var(--text-link);
    font-weight: var(--fw-medium);
    text-decoration: none;
    border-radius: var(--radius-sm);

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }
}

/* --------------------------------------------------------- AppButton */
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-1);
  font: inherit;
  font-weight: var(--fw-semibold);
  font-size: var(--text-md);
  color: var(--brand-accent-fg);
  background: var(--brand-accent);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-5);
  cursor: pointer;
  transition: background var(--dur-base) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);

  &:hover:not(:disabled) {
    background: var(--brand-accent-hover);
  }

  &:active:not(:disabled) {
    background: var(--brand-accent-active);
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 38%, transparent);
  }

  &[aria-busy='true'] {
    cursor: progress;
    opacity: 0.88;
  }

  &:disabled:not([aria-busy='true']) {
    color: var(--text-disabled);
    background: var(--surface-surface);
    cursor: not-allowed;
  }
}

.app-spinner {
  flex: none;
  width: var(--space-4);
  height: var(--space-4);
  border: 2px solid color-mix(in oklab, var(--brand-accent-fg) 40%, transparent);
  border-top-color: var(--brand-accent-fg);
  border-radius: var(--radius-pill);
  animation: app-spin 0.7s linear infinite;
}

/* ------------------------------------------------------ AppFormError */
.app-form-error {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
  color: var(--status-error-fg);
  background: var(--status-error-subtle);
  border: 1px solid color-mix(in oklab, var(--status-error-fg) 24%, transparent);
  border-radius: var(--radius-lg);

  &__icon {
    flex: none;
    margin-top: 1px;
  }
}

/* ------------------------------------------------------ success path */
.app-auth__success {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  font-size: var(--text-md);
  color: var(--status-success-fg);
  background: var(--status-success-subtle);
  border: 1px solid color-mix(in oklab, var(--status-success-fg) 28%, transparent);
  border-radius: var(--radius-lg);
}

/* ----------------------------------------------------------- AppMeta */
.app-auth__meta {
  margin: var(--space-6) 0 0;
  text-align: center;
  font-size: var(--text-md);
  color: var(--text-secondary);

  a {
    color: var(--text-link);
    font-weight: var(--fw-semibold);
    text-decoration: none;
    border-radius: var(--radius-sm);

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand-accent) 32%, transparent);
    }
  }
}

/* one calm staggered fade-up on load (DESIGN.md flourish) */
.app-card > * {
  animation: app-rise var(--dur-slow) var(--ease-decelerate) both;
}
.app-auth__head { animation-delay: 60ms; }
.app-form,
.app-form-error { animation-delay: 120ms; }
.app-auth__meta { animation-delay: 180ms; }

@keyframes app-spin {
  to { transform: rotate(360deg); }
}

@keyframes app-rise {
  from { opacity: 0; transform: translateY(var(--space-2)); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .app-spinner { animation-duration: 1.4s; }
  .app-card > * { animation: none; }
  .app-button:active:not(:disabled) { transform: none; }
}
</style>
