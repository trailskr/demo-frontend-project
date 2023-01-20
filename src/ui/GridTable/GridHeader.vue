<script setup lang="ts">
  interface Props {
    isFetching?: boolean
  }

  defineProps<Props>()
</script>

<template>
  <thead>
    <slot />
    <tr class="!h-0">
      <th
        class="relative"
        colspan="10000"
      >
        <NatLinearProgress
          v-if="isFetching"
          class="bottom-1px"
        />
      </th>
    </tr>
  </thead>
</template>
