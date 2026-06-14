<script setup lang="ts">
  import { AppInput, AppButton } from '@app/ui';
  import { ref, computed } from 'vue';

  const emit = defineEmits<{ save: [url: string] }>();
  const { t } = useI18n({ useScope: 'local' });
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

<i18n lang="json">
{
  "en": { "placeholder": "https://example.com/article", "save": "Save" },
  "ru": { "placeholder": "https://example.com/article", "save": "Сохранить" }
}
</i18n>

<template>
  <form class="app-add-bar" @submit.prevent="onSave">
    <AppInput v-model="url" type="url" :placeholder="t('placeholder')" />
    <AppButton type="submit" :loading="saving" :disabled="!looksValid" :label="t('save')" />
  </form>
</template>

<style scoped lang="scss">
  .app-add-bar {
    display: flex;
    gap: var(--space-2);
  }
</style>
