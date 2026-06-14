<script setup lang="ts">
  import { AppInput, AppButton } from '@app/ui';
  import { ref, computed } from 'vue';

  const emit = defineEmits<{ save: [url: string] }>();
  const { t } = useI18n();
  const url = ref('');
  const saving = ref(false);
  const looksValid = computed(() => /^https?:\/\/.+\..+/.test(url.value.trim()));
  function onSave(): void {
    if (!looksValid.value) return;
    saving.value = true;
    try {
      emit('save', url.value.trim());
      url.value = '';
    } finally {
      saving.value = false;
    }
  }
</script>

<template>
  <form class="app-add-bar" @submit.prevent="onSave">
    <AppInput v-model="url" type="url" :placeholder="t('addBar.placeholder')" />
    <AppButton type="submit" :loading="saving" :disabled="!looksValid" :label="t('addBar.save')" />
  </form>
</template>

<style scoped lang="scss">
  .app-add-bar {
    display: flex;
    gap: var(--space-2);
  }
</style>
