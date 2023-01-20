<script setup lang="ts">
  interface Props {
    disabled?: boolean
    date?: boolean
  }

  defineProps<Props>()

  interface Emits {
    (e: 'click'): void
  }

  const emit = defineEmits<Emits>()
</script>

<template>
  <div class="flex items-center relative color-secondary">
    <IconIcBaselineCalendarToday
      v-if="date"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      width="1.5em"
      height="1.5em"
      aria-hidden="true"
      @click.stop="!disabled && emit('click')"
    />
    <IconIcBaselineAccessTime
      v-else
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      width="1.5em"
      height="1.5em"
      aria-hidden="true"
      @click.stop="!disabled && emit('click')"
    />
  </div>
</template>
