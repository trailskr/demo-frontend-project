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
    modelValue?: number
    lazyModel?: boolean
    integer?: boolean
    round?: number
    min?: number
    max?: number
    maxLength?: number
    textAlign?: 'start' | 'center' | 'end' | 'left' | 'right'
    autocomplete?: 'off' | 'on'
  }

  const props = withDefaults(defineProps<Props>(), {
    autocomplete: 'off'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
    (e: 'paste', modelValue: Props['modelValue']): void
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)

  const inputNumberRef = ref()
  const focus = () => {
    inputNumberRef.value.inputRef.focus()
  }
  defineExpose({ focus })
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
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template #default="{ field }">
      <NatInputNumber
        ref="inputNumberRef"
        class="w-full"
        v-bind="field"
        :lazyModel="lazyModel"
        :integer="integer"
        :round="round"
        :min="min"
        :max="max"
        :maxLength="maxLength"
        :textAlign="textAlign"
        :autocomplete="autocomplete"
        @paste="emit('paste', $event)"
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
