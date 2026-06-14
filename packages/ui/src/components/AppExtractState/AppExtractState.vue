<script setup lang="ts">
  import AppButton from '../AppButton/AppButton.vue';
  import AppStatusBadge from '../AppStatusBadge/AppStatusBadge.vue';

  type ExtractStatus = 'none' | 'extracting' | 'ready' | 'failed';

  defineProps<{
    status: ExtractStatus;
    labels: {
      pitch: string;
      extract: string;
      extracting: string;
      failed: string;
      retry: string;
    };
  }>();

  const emit = defineEmits<{
    extract: [];
  }>();
</script>

<template>
  <div v-if="status !== 'ready'" :class="['app-extract-state', `app-extract-state--${status}`]">
    <!-- none: pitch + extract button -->
    <div v-if="status === 'none'" class="app-extract-state__pitch">
      <p class="app-extract-state__hint">
        {{ labels.pitch }}
      </p>
      <AppButton
        variant="solid"
        color="primary"
        size="md"
        :label="labels.extract"
        data-testid="extract-btn"
        @click="emit('extract')"
      />
    </div>

    <!-- extracting: badge + progress -->
    <div v-else-if="status === 'extracting'" class="app-extract-state__working" role="status">
      <AppStatusBadge status="pending" :label="labels.extracting" />
      <div class="app-extract-state__bar" aria-hidden="true">
        <span class="app-extract-state__bar-fill" />
      </div>
    </div>

    <!-- failed: error message + retry -->
    <div v-else-if="status === 'failed'" class="app-extract-state__failed">
      <p class="app-extract-state__hint">
        {{ labels.failed }}
      </p>
      <AppButton
        variant="solid"
        color="primary"
        size="md"
        :label="labels.retry"
        data-testid="retry-btn"
        @click="emit('extract')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  // Named SCSS variable for the indeterminate animation duration — no --dur-* token
  // covers 1.5 s (only base/fast/slow/slower exist in the contract).
  $bar-anim-dur: 1.5s;

  .app-extract-state {
    padding: var(--space-5);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-sm);

    &--failed {
      border-color: color-mix(in oklab, var(--status-error-fg) 30%, var(--border-default));
    }

    &__pitch,
    &__failed {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
    }

    &__working {
      display: grid;
      gap: var(--space-3);
    }

    &__hint {
      margin: 0;
      font-size: var(--text-md);
      line-height: var(--leading-normal);
      color: var(--text-secondary);
      max-width: 46ch;
    }

    &__bar {
      position: relative;
      height: var(--space-2);
      overflow: hidden;
      background: var(--surface-surface);
      border-radius: var(--radius-pill);
    }

    &__bar-fill {
      position: absolute;
      inset-block: 0;
      inline-size: 40%;
      border-radius: var(--radius-pill);
      background: var(--brand-accent);
      animation: app-extract-indeterminate $bar-anim-dur var(--ease-default) infinite;
    }
  }

  @keyframes app-extract-indeterminate {
    0% {
      transform: translateX(-110%) scaleX(0.6);
    }

    60% {
      transform: translateX(120%) scaleX(1);
    }

    100% {
      transform: translateX(260%) scaleX(0.6);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .app-extract-state__bar-fill {
      animation: none;
      inline-size: 60%;
    }
  }
</style>
