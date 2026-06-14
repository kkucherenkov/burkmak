<template>
  <div class="app-brand">
    <span class="app-brand__mark" aria-hidden="true" />
    <span class="app-brand__word">burkmak</span>
  </div>
</template>

<style scoped lang="scss">
  .app-brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    &__mark {
      width: var(--space-6);
      height: var(--space-6);
      border-radius: var(--radius-pill);
      background: var(--brand-accent);
    }

    &__word {
      font-family: var(--font-display);
      font-weight: var(--fw-semibold);
      color: var(--text-fg);
    }
  }
</style>
