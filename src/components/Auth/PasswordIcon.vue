<script setup lang="ts">
  interface Props {
    modelValue?: boolean
  }

  const props = defineProps<Props>()

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const value = useVModel(props, 'modelValue', emit)
</script>

<template>
  <IconUilEyeSlash
    v-if="value"
    class="transform transition-transform cursor-pointer"
    width="1.5em"
    height="1.5em"
    aria-hidden="true"
    @click.stop="value = false"
  />
  <IconUilEye
    v-else
    class="transform transition-transform cursor-pointer"
    width="1.5em"
    height="1.5em"
    aria-hidden="true"
    @click.stop="value = true"
  />
</template>
