<script setup lang="ts">
  import { SortingDirection } from '@/use/useSorting'

  interface Props {
    direction?: SortingDirection | undefined
    sortingIndex?: number
    isSortable?: boolean
  }

  defineProps<Props>()

  interface Emits {
    (e: 'sort'): void
  }

  const emit = defineEmits<Emits>()
</script>

<template>
  <th class="font-normal text-3 text-tertiary border-b-1 border-substrate group_tilinggrid:!border-b-0">
    <div
      class="flex items-center leading-5"
      :class="{
        'cursor-pointer': isSortable,
        'text-main': direction != null
      }"
      @click="isSortable && emit('sort')"
    >
      <slot />
      <SortingIcon
        v-if="isSortable"
        :direction="direction"
        :sortingIndex="sortingIndex"
      />
    </div>
  </th>
</template>
