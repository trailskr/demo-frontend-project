<script setup lang="ts">
  interface Emits {
    (e: 'submit'): void
  }

  const emit = defineEmits<Emits>()
</script>

<template>
  <form
    novalidate
    @submit.prevent="emit('submit')"
  >
    <slot />
  </form>
</template>
