<script setup lang="ts">
  import { AppInput, AppButton, AppSwitch } from '@app/ui';
  import { ref, computed } from 'vue';

  const emit = defineEmits<{ save: [url: string, kind: 'article' | 'bookmark'] }>();
  const { t } = useI18n();
  const url = ref('');
  const asBookmark = ref(false);
  const saving = ref(false);
  const looksValid = computed(() => /^https?:\/\/.+\..+/.test(url.value.trim()));
  function onSave(): void {
    if (!looksValid.value) return;
    saving.value = true;
    try {
      emit('save', url.value.trim(), asBookmark.value ? 'bookmark' : 'article');
      url.value = '';
      asBookmark.value = false;
    } finally {
      saving.value = false;
    }
  }
</script>

<template>
  <form class="app-add-bar" @submit.prevent="onSave">
    <AppInput v-model="url" type="url" :placeholder="t('addBar.placeholder')" />
    <AppSwitch v-model="asBookmark" :label="t('addBar.asBookmark')" size="sm" />
    <AppButton type="submit" :loading="saving" :disabled="!looksValid" :label="t('addBar.save')" />
  </form>
</template>

<style scoped lang="scss">
  .app-add-bar {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }
</style>
