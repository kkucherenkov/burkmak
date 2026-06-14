<script setup lang="ts">
  import { computed, resolveComponent } from 'vue';
  import type { RouteLocationRaw } from 'vue-router';

  import AppIcon from '../AppIcon/AppIcon.vue';

  type Color = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
  type Variant = 'solid' | 'soft' | 'subtle' | 'outline';
  type Size = 'sm' | 'md' | 'lg';
  type IconSize = 'xs' | 'sm' | 'md';

  const props = withDefaults(
    defineProps<{
      label?: string;
      color?: Color;
      variant?: Variant;
      size?: Size;
      icon?: string;
      dismissible?: boolean;
      selected?: boolean;
      disabled?: boolean;
      /** If set, chip renders as a NuxtLink instead of a button. */
      to?: RouteLocationRaw;
    }>(),
    {
      label: undefined,
      color: 'neutral',
      variant: 'soft',
      size: 'md',
      icon: undefined,
      dismissible: false,
      selected: false,
      disabled: false,
      to: undefined,
    },
  );

  const emit = defineEmits<{
    click: [event: MouseEvent];
    dismiss: [event: Event];
  }>();

  const isLink = computed(() => Boolean(props.to) && !props.disabled);
  const rootTag = computed(() => (isLink.value ? resolveComponent('NuxtLink') : 'button'));

  const rootClasses = computed(() => [
    'app-chip',
    `app-chip--${props.color}`,
    `app-chip--${props.variant}`,
    `app-chip--${props.size}`,
    {
      'app-chip--selected': props.selected,
      'app-chip--disabled': props.disabled,
      'app-chip--dismissible': props.dismissible,
    },
  ]);

  // AppIcon size scale is `xs|sm|md|lg|xl` — chip only uses the small end, one
  // step smaller than the chip itself so the glyph doesn't crowd the label.
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

  function handleClick(event: MouseEvent): void {
    if (props.disabled) return;
    emit('click', event);
  }

  function handleDismiss(event: Event): void {
    if (props.disabled) return;
    // Prevent the dismiss click from bubbling up as a chip click. The caller
    // can listen for `dismiss` and `click` independently.
    event.stopPropagation();
    emit('dismiss', event);
  }
</script>

<template>
  <component
    :is="rootTag"
    :to="to"
    :type="isLink ? undefined : 'button'"
    :class="rootClasses"
    :disabled="isLink ? undefined : disabled"
    :aria-pressed="selected ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    @click="handleClick"
  >
    <AppIcon v-if="icon" :name="icon" :size="iconSize" class="app-chip__icon" />
    <span v-if="$slots['default'] || label" class="app-chip__label">
      <slot>{{ label }}</slot>
    </span>
    <span
      v-if="dismissible"
      class="app-chip__dismiss"
      role="button"
      tabindex="0"
      aria-label="Dismiss"
      @click="handleDismiss"
      @keydown.enter.prevent="handleDismiss"
      @keydown.space.prevent="handleDismiss"
    >
      <AppIcon name="i-lucide-x" :size="iconSize" />
    </span>
  </component>
</template>

<style lang="scss" scoped>
  .app-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-6);
    border: 1px solid transparent;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--text-fg);
    font-family: var(--font-sans);
    font-weight: var(--fw-medium);
    font-size: var(--text-sm);
    line-height: var(--leading-snug);
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--dur-fast) var(--ease-default),
      border-color var(--dur-fast) var(--ease-default),
      color var(--dur-fast) var(--ease-default);

    &:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    &__icon {
      flex-shrink: 0;
    }

    &__label {
      display: inline-flex;
      align-items: center;
    }

    &__dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-inline-start: var(--space-1);
      padding: var(--space-1);
      border-radius: var(--radius-pill);
      color: currentcolor;
      cursor: pointer;
      transition: background-color var(--dur-fast) var(--ease-default);

      &:hover {
        background-color: var(--surface-surface);
      }

      &:focus-visible {
        outline: none;
        box-shadow: var(--shadow-focus);
      }
    }

    /* ----- sizes ----- */
    &--sm {
      padding: var(--space-1) var(--space-4);
      font-size: var(--text-xs);
    }

    &--md {
      padding: var(--space-2) var(--space-6);
      font-size: var(--text-sm);
    }

    &--lg {
      padding: var(--space-3) var(--space-8);
      font-size: var(--text-md);
    }

    /* ----- colour × variant matrix -----
     Each (colour) block defines the `solid`, `soft`, `subtle`, `outline`
     variants by composing token families. `subtle` is a lighter take on
     `soft` — the background is the same token at a reduced opacity. */
    &--primary {
      &.app-chip--solid {
        background-color: var(--brand-accent);
        border-color: var(--brand-accent);
        color: var(--text-inverse);
      }

      &.app-chip--soft {
        background-color: var(--brand-accent-subtle);
        color: var(--brand-accent-fg);
      }

      &.app-chip--subtle {
        background-color: color-mix(in srgb, var(--brand-accent-subtle) 60%, transparent);
        color: var(--brand-accent-fg);
      }

      &.app-chip--outline {
        border-color: var(--brand-accent);
        color: var(--brand-accent-fg);
      }
    }

    &--neutral {
      &.app-chip--solid {
        background-color: var(--text-fg);
        border-color: var(--text-fg);
        color: var(--text-inverse);
      }

      &.app-chip--soft {
        background-color: var(--surface-surface);
        color: var(--text-fg);
      }

      &.app-chip--subtle {
        background-color: color-mix(in srgb, var(--surface-surface) 60%, transparent);
        color: var(--text-secondary);
      }

      &.app-chip--outline {
        border-color: var(--border-strong);
        color: var(--text-fg);
      }
    }

    &--success {
      &.app-chip--solid {
        background-color: var(--status-success-fg);
        border-color: var(--status-success-fg);
        color: var(--text-inverse);
      }

      &.app-chip--soft {
        background-color: var(--status-success-subtle);
        color: var(--status-success-fg);
      }

      &.app-chip--subtle {
        background-color: color-mix(in srgb, var(--status-success-subtle) 60%, transparent);
        color: var(--status-success-fg);
      }

      &.app-chip--outline {
        border-color: var(--status-success-fg);
        color: var(--status-success-fg);
      }
    }

    &--warning {
      &.app-chip--solid {
        background-color: var(--status-warning-fg);
        border-color: var(--status-warning-fg);
        color: var(--text-inverse);
      }

      &.app-chip--soft {
        background-color: var(--status-warning-subtle);
        color: var(--status-warning-fg);
      }

      &.app-chip--subtle {
        background-color: color-mix(in srgb, var(--status-warning-subtle) 60%, transparent);
        color: var(--status-warning-fg);
      }

      &.app-chip--outline {
        border-color: var(--status-warning-fg);
        color: var(--status-warning-fg);
      }
    }

    &--error {
      &.app-chip--solid {
        background-color: var(--status-error-fg);
        border-color: var(--status-error-fg);
        color: var(--text-inverse);
      }

      &.app-chip--soft {
        background-color: var(--status-error-subtle);
        color: var(--status-error-fg);
      }

      &.app-chip--subtle {
        background-color: color-mix(in srgb, var(--status-error-subtle) 60%, transparent);
        color: var(--status-error-fg);
      }

      &.app-chip--outline {
        border-color: var(--status-error-fg);
        color: var(--status-error-fg);
      }
    }

    &--info {
      &.app-chip--solid {
        background-color: var(--status-info-fg);
        border-color: var(--status-info-fg);
        color: var(--text-inverse);
      }

      &.app-chip--soft {
        background-color: var(--status-info-subtle);
        color: var(--status-info-fg);
      }

      &.app-chip--subtle {
        background-color: color-mix(in srgb, var(--status-info-subtle) 60%, transparent);
        color: var(--status-info-fg);
      }

      &.app-chip--outline {
        border-color: var(--status-info-fg);
        color: var(--status-info-fg);
      }
    }

    /* ----- selected / disabled ----- */
    &--selected {
      border-color: var(--brand-accent);
      box-shadow: inset 0 0 0 1px var(--brand-accent);
    }

    &--disabled {
      cursor: not-allowed;
      opacity: var(--opacity-disabled);

      .app-chip__dismiss {
        cursor: not-allowed;
      }
    }
  }
</style>
