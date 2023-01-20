<script setup lang="ts">
  interface Props {
    modelValue?: unknown
  }

  const props = defineProps<Props>()

  const value = computed(() => {
    if (props.modelValue === undefined) return 'undefined'
    return JSON.stringify(props.modelValue, null, '  ')
  })
</script>

<template>
  <pre class="inline-block">{{ value }}</pre>
</template>
