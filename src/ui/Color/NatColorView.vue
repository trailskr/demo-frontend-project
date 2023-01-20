<script setup lang="ts">
  import convert from 'color-convert'

  interface Props {
    modelValue?: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '#000000'
  })

  const lightness = computed(() => props.modelValue ? convert.hex.hsl(props.modelValue)[2] : 128)
</script>

<template>
  <div
    class="h-11.5 rounded-5px overflow-hidden"
    style="background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==')"
  >
    <div
      class="h-full rounded-5px"
      :class="{ 'border-1 border-substrate': lightness > 97 }"
      :style="{ background: modelValue ?? undefined }"
    />
  </div>
</template>
