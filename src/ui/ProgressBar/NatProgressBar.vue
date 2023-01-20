<script setup lang="ts">
  interface Props {
    modelValue?: number
  }

  defineProps<Props>()
</script>

<template>
  <div class="w-full bg-substrate rounded-full h-2.5 px-1 py-0.75">
    <div
      class="bg-primary h-1 rounded-full"
      :style="{ width: `${modelValue}%` }"
    ></div>
  </div>
</template>
