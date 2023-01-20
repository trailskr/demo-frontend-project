<script setup lang="ts">
  interface Props {
    isLoading?: boolean
    allowClear?: boolean
    hasValue?: boolean
    disabled?: boolean
  }

  defineProps<Props>()

  interface Emits {
    (e: 'reset'): void
    (e: 'angle'): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()
</script>

<template>
  <div class="flex items-center relative">
    <NatSpinner
      v-if="isLoading"
      class="absolute left-0 top-0 text-primary"
      size="1.5em"
    />
    <IconEvaCloseFill
      v-if="allowClear && hasValue"
      class="transform transition-transform font-medium"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      width="1.5em"
      height="1.5em"
      role="button"
      :title="t('to-clear')"
      @click.stop="!disabled && emit('reset')"
    />
    <IconUilAngleDown
      class="transform transition-transform"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      width="1.5em"
      height="1.5em"
      aria-hidden="true"
      @click.stop="!disabled && emit('angle')"
    />
  </div>
</template>
