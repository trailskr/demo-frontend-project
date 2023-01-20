<script setup lang="ts">
  interface Props {
    modelValue?: any
    valueToSet?: any
  }

  defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', v: any): void
  }

  const emit = defineEmits<Emits>()
</script>

<template>
  <div class="space-x-2">
    <NatButton
      @click="emit('update:modelValue', valueToSet)"
    >
      Set
    </NatButton>
    <NatButton
      @click="emit('update:modelValue', null)"
    >
      Clear
    </NatButton>
  </div>
</template>
