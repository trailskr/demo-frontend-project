<script setup lang="ts">
  import { StyleValue } from 'vue'

  interface Props {
    modelValue?: number | null
    min?: number
    max?: number
    step?: number
    trackClass?: string
    trackStyle?: StyleValue
    trackBgStyle?: StyleValue
    trackBgClass?: StyleValue
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    min: 0,
    max: 100
  })

  interface Emits {
    (e: 'update:modelValue', v: number | undefined): void
  }

  const emit = defineEmits<Emits>()

  const model = useVModel(props, 'modelValue', emit)
</script>

<template>
  <div class="w-full p-2 flex items-center">
    <div
      class="flex-auto rounded-full"
      :class="trackBgClass"
      :style="trackBgStyle"
    >
      <div
        class="h-3 rounded-full bg-substrate"
        :class="trackClass"
        :style="trackStyle"
      >
        <input
          v-model.number="model"
          class="w-full m-0 bg-transparent focus:outline-none h-0"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
  input[type=range] {
    -webkit-appearance: none;
  }

  input[type=range]::-ms-track {
    width: 100%;
    height: 0;
    @apply: cursor-pointer bg-transparent color-transparent border-transparent
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    @apply: h-4 w-4 rounded-full bg-emphasis cursor-pointer -mt-4.725;
  }

  input[type=range][disabled]::-webkit-slider-thumb {
    -webkit-appearance: none;
    @apply: opacity-20 cursor-not-allowed;
  }
</style>
