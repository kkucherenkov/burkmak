<script setup lang="ts">
  const props = defineProps<{ score: number; label: string }>();
  const segments = [1, 2, 3, 4];
  const isOn = (n: number): boolean => props.score >= n;
</script>

<template>
  <div class="app-strength" :class="`app-strength--${score}`">
    <div class="app-strength__track">
      <span
        v-for="n in segments"
        :key="n"
        class="app-strength__seg"
        :class="{ 'app-strength__seg--on': isOn(n) }"
      />
    </div>
    <span class="app-strength__label">{{ label }}</span>
  </div>
</template>

<style scoped lang="scss">
  .app-strength {
    display: flex;
    align-items: center;
    gap: var(--space-3);

    &__track {
      display: flex;
      gap: var(--space-1);
      flex: 1;
    }

    &__seg {
      height: var(--space-1);
      flex: 1;
      border-radius: var(--radius-pill);
      background: var(--border-default);

      &--on {
        background: var(--text-tertiary);
      }
    }

    &__label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    // tint filled segments by score: 1→error, 2→warning, 3→info, 4→success
    &--1 .app-strength__seg--on {
      background: var(--status-error-fg);
    }

    &--2 .app-strength__seg--on {
      background: var(--status-warning-fg);
    }

    &--3 .app-strength__seg--on {
      background: var(--status-info-fg);
    }

    &--4 .app-strength__seg--on {
      background: var(--status-success-fg);
    }
  }
</style>
