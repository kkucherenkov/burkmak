import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2026-04-18',
  srcDir: 'app/',
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],

  nitro: {
    // No explicit `preset: 'static'`. With `ssr: false` Nuxt infers the static
    // preset automatically on `nuxt generate`, and forcing it here triggers
    // Nitro's "Payload extraction is recommended" warning that cannot be
    // silenced by user config — `@nuxt/schema` hard-resolves
    // `experimental.payloadExtraction` to `false` whenever `ssr: false`,
    // which the same module then flags as a missing opt-in. Upstream bug.
    //
    // Separately, Nuxt 4.4 + Nitro 2.13 ship overlapping `useAppConfig`
    // auto-imports (`nitropack/runtime/internal/config` +
    // `@nuxt/nitro-server/.../app-config`). Unimport logs a benign
    // "Duplicated imports" warning; @nuxt/nitro-server's copy wins.
    // Pending https://github.com/nuxt/nuxt — expected to clear in 4.5.
  },

  // Translations live in apps/web/i18n/locales/{en,ru}.ts (global langDir files).
  // WHY: Vite 8 + @nuxtjs/i18n SFC <i18n lang="json"> blocks produce
  // `?vue&type=i18n&lang.json` virtual modules that Vite 8 cannot parse at
  // build time. .ts locale files avoid the virtual-module path entirely.
  // Use `useI18n()` (global scope) with namespaced keys (e.g. `t('welcome.title')`).
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.ts' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.ts' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle libs Vite would otherwise discover at runtime and trigger
    // a full dev-server reload for.
    optimizeDeps: {
      include: ['better-auth/vue'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1',
      authBaseUrl: process.env.NUXT_PUBLIC_AUTH_BASE_URL ?? 'http://localhost:3000',
    },
  },

  ui: {
    colorMode: true,
  },

  devServer: {
    port: 3001,
    host: '0.0.0.0',
  },
});
