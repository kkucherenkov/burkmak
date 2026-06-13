<script setup lang="ts">
  import { computed } from 'vue';

  import AppIcon from '../AppIcon/AppIcon.vue';

  type Variant = 'solid' | 'outline' | 'ghost' | 'link';
  type Color = 'primary' | 'neutral' | 'success' | 'warning' | 'error';
  type Size = 'sm' | 'md' | 'lg';
  type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  const props = withDefaults(
    defineProps<{
      label?: string;
      variant?: Variant;
      color?: Color;
      size?: Size;
      loading?: boolean;
      disabled?: boolean;
      block?: boolean;
      type?: 'button' | 'submit' | 'reset';
      icon?: string;
      iconTrailing?: string;
    }>(),
    {
      label: undefined,
      variant: 'solid',
      color: 'primary',
      size: 'md',
      loading: false,
      disabled: false,
      block: false,
      type: 'button',
      icon: undefined,
      iconTrailing: undefined,
    },
  );

  const emit = defineEmits<{ click: [event: MouseEvent] }>();

  const iconSize = computed<IconSize>(() => {
    switch (props.size) {
      case 'sm': {
        return 'xs';
      }
      case 'lg': {
        return 'md';
      }
      default: {
        return 'sm';
      }
    }
  });

  const isDisabled = computed(() => props.disabled || props.loading);

  const classes = computed(() => [
    'app-button',
    `app-button--${props.size}`,
    `app-button--${props.variant}`,
    `app-button--${props.color}`,
    { 'app-button--block': props.block },
    { 'app-button--loading': props.loading },
    { 'app-button--disabled': isDisabled.value },
  ]);

  function onClick(event: MouseEvent): void {
    if (isDisabled.value) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    emit('click', event);
  }
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    :aria-disabled="isDisabled || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="app-button__spinner" aria-hidden="true" />
    <AppIcon
      v-if="icon && !loading"
      :name="icon"
      :size="iconSize"
      class="app-button__icon app-button__icon--leading"
    />
    <span v-if="$slots['default'] || label" class="app-button__label">
      <slot>{{ label }}</slot>
    </span>
    <AppIcon
      v-if="iconTrailing"
      :name="iconTrailing"
      :size="iconSize"
      class="app-button__icon app-button__icon--trailing"
    />
  </button>
</template>

<style lang="scss" scoped>
  // Button height scale — not in the global token set, owned here.
  $btn-h-sm: 28px;
  $btn-h-md: 36px;
  $btn-h-lg: 44px;
  // Spinner rotation — intentionally faster than --dur-slow; not a UI transition.
  $btn-spin-dur: 650ms;

  .app-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-weight: var(--fw-medium);
    line-height: var(--leading-snug);
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    transition:
      background-color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease),
      box-shadow var(--dur-fast) var(--ease);

    &:focus-visible {
      outline: 2px solid var(--brand-accent);
      outline-offset: 2px;
    }

    &__icon {
      flex-shrink: 0;
    }

    &__label {
      display: inline-flex;
      align-items: center;
    }

    &__spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentcolor;
      border-right-color: transparent;
      border-radius: var(--radius-pill);
      animation: app-button-spin $btn-spin-dur linear infinite;
      flex-shrink: 0;
    }

    &--sm {
      font-size: var(--text-sm);
      padding: var(--space-3) var(--space-6);
      min-height: $btn-h-sm;
    }

    &--md {
      font-size: var(--text-base);
      padding: var(--space-4) var(--space-8);
      min-height: $btn-h-md;
    }

    &--lg {
      font-size: var(--text-lg);
      padding: var(--space-5) var(--space-10);
      min-height: $btn-h-lg;
    }

    &--block {
      display: flex;
      width: 100%;
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--solid {
      &.app-button--primary {
        background-color: var(--brand-accent);
        color: var(--text-fg-inverse);

        &:hover:not(.app-button--disabled) {
          background-color: var(--brand-accent-hover);
        }

        &:active:not(.app-button--disabled) {
          background-color: var(--brand-accent-active);
        }
      }

      &.app-button--neutral {
        background-color: var(--text-fg);
        color: var(--text-fg-inverse);

        &:hover:not(.app-button--disabled) {
          background-color: var(--text-fg-muted);
        }
      }

      &.app-button--success {
        background-color: var(--status-success);
        color: var(--text-fg-inverse);
      }

      &.app-button--warning {
        background-color: var(--status-warning);
        color: var(--text-fg-inverse);
      }

      &.app-button--error {
        background-color: var(--status-danger);
        color: var(--text-fg-inverse);
      }
    }

    &--outline {
      background-color: transparent;

      &.app-button--primary {
        border-color: var(--brand-accent);
        color: var(--brand-accent);

        &:hover:not(.app-button--disabled) {
          background-color: var(--brand-accent-soft);
        }
      }

      &.app-button--neutral {
        border-color: var(--border-default);
        color: var(--text-fg);

        &:hover:not(.app-button--disabled) {
          background-color: var(--surface-surface-alt);
        }
      }

      &.app-button--success {
        border-color: var(--status-success);
        color: var(--status-success);
      }

      &.app-button--warning {
        border-color: var(--status-warning);
        color: var(--status-warning);
      }

      &.app-button--error {
        border-color: var(--status-danger);
        color: var(--status-danger);
      }
    }

    &--ghost {
      background-color: transparent;
      border-color: transparent;

      &.app-button--primary {
        color: var(--brand-accent);

        &:hover:not(.app-button--disabled) {
          background-color: var(--brand-accent-soft);
        }
      }

      &.app-button--neutral {
        color: var(--text-fg);

        &:hover:not(.app-button--disabled) {
          background-color: var(--surface-surface-alt);
        }
      }

      &.app-button--success {
        color: var(--status-success);
      }

      &.app-button--warning {
        color: var(--status-warning);
      }

      &.app-button--error {
        color: var(--status-danger);
      }
    }

    &--link {
      background-color: transparent;
      border-color: transparent;
      padding-left: 0;
      padding-right: 0;
      min-height: 0;

      &.app-button--primary {
        color: var(--brand-accent);

        &:hover:not(.app-button--disabled) {
          text-decoration: underline;
        }
      }

      &.app-button--neutral {
        color: var(--text-fg);

        &:hover:not(.app-button--disabled) {
          text-decoration: underline;
        }
      }
    }
  }

  @keyframes app-button-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
