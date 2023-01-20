<script setup lang="ts">
  interface Props {
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
    integer: false,
    placeholder: '',
    textAlign: 'start'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
    (e: 'paste', pasteValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const input = ref<HTMLInputElement>()

  const updateInputValue = () => {
    if (!input.value) return
    input.value.value = Number.isFinite(props.modelValue) ? `${props.modelValue}` : ''
  }

  const roundMul = computed(() => props.round != null
    ? Math.pow(10, props.round)
    : undefined)

  let isInternalChange = false

  const onValue = (e: Event) => {
    isInternalChange = true
    const listenEventType = props.lazyModel ? 'change' : 'input'
    if (e.type !== listenEventType) return

    const target = e.target as HTMLInputElement | null
    if (!target) return

    // value is not a number
    if (target.validity.badInput) return true

    let num = target.valueAsNumber
    if (isNaN(num)) {
      // value is empty string
      emit('update:modelValue', undefined)
      return
    }

    if (props.min != null && num < props.min) num = props.min
    if (props.max != null && num > props.max) num = props.max
    if (props.maxLength && target.value.length > props.maxLength) {
      num = +target.value.substring(0, props.maxLength)
      target.valueAsNumber = num
    }

    num = props.integer
      ? Math.round(num)
      : roundMul.value != null
        ? Math.round(roundMul.value * num) / roundMul.value
        : num
    emit('update:modelValue', num)
    nextTick(() => {
      isInternalChange = false
    })
  }

  watch(() => props.modelValue, (val) => {
    if (isInternalChange) return
    updateInputValue()
  })

  onMounted(updateInputValue)

  const onBlur = (e: FocusEvent) => {
    const target = e.target as HTMLInputElement | null
    if (!target) return
    if (target.validity.badInput) return
    updateInputValue()
  }

  const onPaste = (e: ClipboardEvent) => {
    const pasteText = e.clipboardData?.getData('text')
    if (!pasteText || !/^\d+$/.test(pasteText)) return

    emit('paste', +pasteText)
  }

  const inputRef = ref()
  defineExpose({ inputRef })
</script>

<template>
  <input
    ref="input"
    type="number"
    :min="min"
    :max="max"
    :autocomplete="autocomplete"
    :style="{ textAlign }"
    @input="onValue"
    @change="onValue"
    @blur="onBlur"
    @paste="onPaste"
  >
</template>
