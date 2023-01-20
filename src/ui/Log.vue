<script setup lang="ts">
  interface Props {
    modelValue: unknown
  }
  const props = defineProps<Props>()

  onUpdated(() => {
    console.log(props.modelValue)
  })
</script>

<template>
  <slot />
</template>
