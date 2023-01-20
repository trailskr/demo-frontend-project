<script setup lang="ts">
  interface Props {
    isHoverable?: boolean
  }

  withDefaults(defineProps<Props>(), {
    isHoverable: true
  })
</script>

<template>
  <tr
    class="group_row"
    :class="isHoverable && 'group_rowhoverable'"
  >
    <td class="w-2.5 group_rowhoverable-hover:bg-substrate group_row-not-last:border-b-1 border-substrate group_tilinggrid:rounded-l-5px group_tilinggrid:!border-b-0" />
    <slot />
    <td class="w-2.5 group_rowhoverable-hover:bg-substrate group_row-not-last:border-b-1 border-substrate group_tilinggrid:rounded-r-5px group_tilinggrid:!border-b-0" />
  </tr>
</template>
