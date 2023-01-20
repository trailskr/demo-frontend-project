<script setup lang="ts">
  import { StyleValue } from 'vue'

  import { Validation } from '@/utils/Validation'
  import { isBoolean } from '@/utils/typecheck'

  import { getFieldId } from './field'

  interface PaddingClasses { x?: string, y?: string, left?: string, right?: string }

  interface Props {
    name?: string
    modelValue?: any
    lazyValue?: boolean
    validation?: Validation
    label?: string
    disabled?: boolean
    required?: boolean
    placeholder?: string
    padding?: boolean | PaddingClasses
    border?: boolean
    contentClass?: string
    contentStyle?: StyleValue
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    padding: true,
    border: true
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
  }

  const emit = defineEmits<Emits>()

  const contentRef = ref<HTMLElement>()

  const id = getFieldId()

  const isInvalid = computed(() => props.validation ? props.validation.isInvalid : false)
  const errors = computed(() => props.validation ? props.validation.errors.map((err) => err.message) : [])

  const yPaddingDefaultClass = computed(() => props.compact ? 'py-1' : 'py-2.5')
  const getPadding = (key: keyof PaddingClasses, defaultClass: string) => {
    if (isBoolean(props.padding)) {
      return props.padding ? defaultClass : null
    }

    return props.padding[key] ?? defaultClass
  }

  const validateValue = (value: unknown) => {
    props.validation?.test(value)
  }

  const handleModelChange = (v: any) => {
    emit('update:modelValue', v)
    if (!props.lazyValue) validateValue(v)
  }

  const handleBlur = (e: FocusEvent) => {
    if (props.lazyValue) validateValue(props.modelValue)
    emit('blur', e)
  }

  const handleFocus = (e: FocusEvent) => {
    emit('focus', e)
  }

  const fieldProps = computed(() => ({
    id,
    name: props.name,
    disabled: props.disabled,
    required: props.required,
    placeholder: props.placeholder,
    modelValue: props.modelValue,
    'onUpdate:modelValue': handleModelChange,
    class: 'group_field-focus-within:placeholder-gray-500',
    onBlur: handleBlur,
    onFocus: handleFocus
  }))
</script>

<template>
  <div>
    <label
      v-if="label"
      class="block text-3"
      :class="[validation?.isInvalid ? 'text-danger' : 'text-tertiary', compact ? 'pb-1' : 'py-2']"
      :for="id"
    >
      {{ label }}<span
        v-if="required"
        class="text-primary text-sup"
      > *</span>
    </label>
    <label
      ref="contentRef"
      class="flex items-center text-secondary transition bg-white rounded-5px dark:bg-primary relative group_field focus-within:bg-white dark:focus-within:bg-black cursor-inherit"
      :class="[
        getPadding('x', 'px-3'),
        {
          'border-1 border-substrate hover:border-tertiary !focus-within:border-primary': border,
          'cursor-not-allowed text-opacity-40': disabled,
          '!border-danger !text-danger': isInvalid
        },
        contentClass
      ]"
      :style="contentStyle"
      :for="id"
    >
      <span
        class="transition absolute -inset-px pointer-events-none rounded-5px group_field-focus-within:bg-opacity-0"
        :class="{ 'bg-opacity-20 bg-black ': disabled }"
      />
      <slot name="left" />
      <div
        class="flex-auto"
        :class="[
          getPadding('y', yPaddingDefaultClass),
          $slots.left ? getPadding('left', 'ml-2') : null,
          $slots.right ? getPadding('right', 'mr-1') : null,
        ]"
      >
        <div class="flex flex-col items-stretch flex-auto">
          <slot
            :field="fieldProps"
            :isInvalid="isInvalid"
            :errors="errors"
            :contentRef="contentRef"
          />
        </div>
      </div>
      <slot name="right" />
    </label>
    <div
      v-if="isInvalid"
      class="text-3 text-danger pl-1 pt-1"
    >
      {{ errors[0] }}
    </div>
  </div>
</template>
