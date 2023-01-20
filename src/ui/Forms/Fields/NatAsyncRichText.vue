<script setup lang="ts">
  import { Validation } from '@/utils/Validation'

  export interface Props {
    // Field
    name?: string
    validation?: Validation
    label?: string
    disabled?: boolean
    required?: boolean
    placeholder?: string
    contentClass?: string

    // InputNumber
    modelValue?: string | null
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const { t } = useI18n()

  const value = useVModel(props, 'modelValue', emit)
</script>

<template>
  <NatField
    v-model="value"
    :name="name"
    :validation="validation"
    :label="label"
    :disabled="disabled"
    :required="required"
    :placeholder="placeholder"
    :contentClass="contentClass"
    :padding="false"
  >
    <template #default="{ field }">
      <NatAsyncInputRichText
        class="w-full"
        v-bind="field"
        :label="t('instructions')"
        :disabled="disabled"
      />
    </template>
    <template
      v-if="$slots.left"
      #left
    >
      <slot name="left" />
    </template>
    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>
  </NatField>
</template>
