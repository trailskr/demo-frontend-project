<script setup lang="ts">
  interface Props {
    isCreateMode?: boolean
    isLoading?: boolean
    isSaving?: boolean
    errorMessage?: string
    okText?: string
    cancelText?: string
    semantics?: 'danger' | 'accent'
    resetValidation?: () => void
    hideActions?: boolean
  }

  defineProps<Props>()

  interface Emits {
    (e: 'cancel'): void
    (e: 'save'): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()
</script>

<template>
  <NatForm
    class="relative"
    @submit="emit('save')"
  >
    <slot />
    <NatSpinner
      v-if="isLoading"
      class="text-primary"
      wrap
    />
    <MessageAlert
      semantics="error"
      class="mt-4"
      :modelValue="errorMessage"
      @hide="resetValidation?.()"
    />
    <div
      v-if="!hideActions"
      class="mt-10 flex items-center justify-end gap-2.5"
    >
      <NatButton
        class="flex-auto sm:flex-initial sm:min-w-36"
        :label="cancelText ?? t('cancel')"
        semantics="substrate"
        @click="emit('cancel')"
      />
      <NatButton
        class="flex-auto sm:flex-initial sm:min-w-36"
        :label="okText ?? (isCreateMode ? t('create') : t('save'))"
        :semantics="semantics ?? 'accent'"
        type="submit"
        :disabled="isLoading"
        :loading="isSaving"
      />
    </div>
  </NatForm>
</template>
