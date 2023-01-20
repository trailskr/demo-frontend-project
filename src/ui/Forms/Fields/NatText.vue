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

    // InputText
    modelValue?: string | null
    lazyModel?: boolean
    type?: string
    textAlign?: 'start' | 'center' | 'end' | 'left' | 'right'
    multiline?: boolean
    minHeightInRows?: number
    maxHeightInRows?: number
    maxLength?: number
    autocomplete?: 'off' | 'on'
  }

  const props = withDefaults(defineProps<Props>(), {
    autocomplete: 'off'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)

  const inputTextRef = ref()
  const focus = () => {
    inputTextRef.value.inputRef.focus()
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
  >
    <template #default="{ field }">
      <NatInputText
        ref="inputTextRef"
        class="w-full"
        v-bind="field"
        :lazyModel="lazyModel"
        :type="type"
        :textAlign="textAlign"
        :multiline="multiline"
        :minHeightInRows="minHeightInRows"
        :maxHeightInRows="maxHeightInRows"
        :maxLength="maxLength"
        :autocomplete="autocomplete"
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
