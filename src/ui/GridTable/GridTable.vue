<script setup lang="ts">
  interface Props {
    isLoading?: boolean
    tiling?: boolean
  }

  defineProps<Props>()
</script>

<template>
  <div
    class="bg-white rounded-5px text-secondary min-w-min relative"
    :class="{ 'min-h-64': isLoading }"
  >
    <table
      class="w-full"
      :class="{ 'group_tilinggrid': tiling }"
    >
      <slot />
    </table>
    <NatSpinner
      v-if="isLoading"
      class="rounded-5px"
      wrap
    />
  </div>
</template>

<style>
  td {
    background: var(--row-bg)
  }
</style>
