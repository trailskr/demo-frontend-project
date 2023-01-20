<script setup lang="ts">
  import { SortingDirection } from '@/use/useSorting'

  interface Props {
    direction?: SortingDirection | undefined
    sortingIndex?: number
  }

  defineProps<Props>()
</script>

<template>
  <div>
    <IconPhArrowUpThin
      class="text-accent transition w-5 h-5"
      :class="{ 'rotate-180': direction === SortingDirection.Asc, 'opacity-0': !direction }"
    />
    {{ sortingIndex }}
  </div>
</template>
