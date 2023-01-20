<script setup lang="ts">
  import { onVisible } from '@/use/onVisible'
  import { isEqual } from '@/utils/utils'

  import { calculateTextAreaHeight, TextAreaHeightCalculation } from './calculateTextareaHeight'

  interface Props {
    minHeightInRows?: number
    maxHeightInRows?: number
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'onHeightChange', height: number): void
  }

  const emit = defineEmits<Emits>()

  const textarea = ref<HTMLTextAreaElement>()

  const currentState = ref<TextAreaHeightCalculation>()

  const height = computed(() => currentState.value ? `${currentState.value.height}px` : undefined)

  const resizeComponent = (callback?: () => void) => {
    if (!textarea.value) return callback?.()

    const newState = calculateTextAreaHeight(
      textarea.value,
      props.minHeightInRows,
      props.maxHeightInRows
    )

    if (newState === undefined) {
      callback?.()
      return
    }

    if (!isEqual(currentState.value, newState)) {
      currentState.value = newState
      emit('onHeightChange', newState.height)
      return
    }

    callback?.()
  }

  let resizeLock = false
  useEventListener('resize', () => {
    if (resizeLock) return
    resizeLock = true
    resizeComponent(() => {
      resizeLock = false
    })
  })

  onUpdated(() => {
    resizeComponent()
  })

  onVisible(textarea, () => {
    resizeComponent()
  })
</script>

<template>
  <textarea
    ref="textarea"
    class="resize-none w-full"
    :style="{ height }"
  />
</template>
