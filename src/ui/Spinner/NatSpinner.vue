<script setup lang="ts">
  import SpinnerSvg from '@/ui/Spinner/SpinnerSvg.vue'

  interface Props {
    wrap?: boolean
    size?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    wrap: false,
    size: '1.5rem'
  })

  const sizeStyle = computed(() => ({ width: props.size, height: props.size }))
</script>

<template>
  <div
    v-if="wrap"
    class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-1"
  >
    <SpinnerSvg :style="sizeStyle" />
  </div>
  <SpinnerSvg
    v-else
    class="inline-block align-bottom"
    :style="sizeStyle"
  />
</template>
