<script setup lang="ts">
  interface Props {
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
    type: 'text',
    textAlign: 'start'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)

  const onValue = (e: Event) => {
    const listenEventType = props.lazyModel ? 'change' : 'input'
    if (e.type !== listenEventType) return

    const target = e.target as HTMLInputElement | null
    if (!target) return

    value.value = target.value
  }

  const inputRef = ref()
  defineExpose({ inputRef })
</script>

<template>
  <NatTextarea
    v-if="multiline"
    :type="type"
    :value="value"
    :style="{ textAlign }"
    :minHeightInRows="minHeightInRows"
    :maxHeightInRows="maxHeightInRows"
    :maxLength="maxLength"
    @input="onValue"
    @change="onValue"
  />
  <input
    v-else
    ref="inputRef"
    :type="type"
    :value="value"
    :style="{ textAlign }"
    :maxLength="maxLength"
    :autocomplete="autocomplete"
    @input="onValue"
    @change="onValue"
  >
</template>
