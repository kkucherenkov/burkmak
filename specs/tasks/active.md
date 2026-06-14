# Active tasks

## T-2026-06-14-003 — S1-auth surface (welcome / sign-in / sign-up)

- Created: 2026-06-14
- Owner: claude
- Branch: `feat/s1-auth`
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4/B5 (auth)
- Plan: [specs/features/2026-06-13-s1-auth.plan.md](../features/2026-06-13-s1-auth.plan.md)
- Goal: full email/password auth surface on web + mobile from the mockups — welcome/sign-in/sign-up pages + guard (web); reskin sign_in + build sign_up + welcome (mobile). Email/password both sides (confirmed).
- Codegen impact: no (Better Auth mounts /api/v1/auth/\* outside OpenAPI)
- Sub-steps (web):
  - [x] W1: auth-validation + password-strength utils (TDD)
  - [x] W2: extend useAuth with signUp.email
  - [x] W3: app-local AppBrand/AppFormError/AppStrength
  - [x] W4: welcome.vue
  - [x] W5: sign-in.vue (replace login.vue)
  - [x] W6: sign-up.vue
  - [x] W7: auth/guest middleware + index redirect
  - [x] W8: web verification
- Sub-steps (mobile):
  - [x] M1: email sign-in i18n keys
  - [x] M2: sign_in_screen → email/password
  - [x] M3: sign_up_screen real form
  - [x] M4: welcome_screen polish
  - [x] M5: cubit tests (signIn/signUp)
  - [x] M6: mobile verification
- Status: in-progress
- Blockers: —
