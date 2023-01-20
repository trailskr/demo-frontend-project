<script setup lang="ts">
  import { Validation } from '@/utils/Validation'

  export interface Props {
    // Field
    name?: string
    validation?: Validation
    label?: string
    disabled?: boolean
    required?: boolean

    // InputColor
    modelValue?: string | null
    allowOpacityChange?: boolean
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

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
    :padding="false"
    :border="false"
  >
    <template #default="{ field }">
      <NatInputColor
        class="w-full h-11.5"
        v-bind="field"
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
