<script setup lang="ts">
  import { ColumnDef } from '@/ui/DataGrid/dataGrid'
  import { ChangeSortingFn, SortingItem, SortingsMap } from '@/use/useSorting'

  interface Props {
    cols: ColumnDef[]
    sortings: SortingItem[]
    sortingsMap: SortingsMap
    changeSorting: ChangeSortingFn
  }

  const props = defineProps<Props>()

  const getSortingIndex = (col: ColumnDef): number | undefined => {
    if (props.sortings.length <= 1) return undefined
    const sorting = props.sortingsMap[col.key]
    return sorting ? sorting.index + 1 : undefined
  }
</script>

<template>
  <NatDropdown>
    <template #reference="{ ref, toggle }">
      <NatButton
        :ref="ref"
        class="w-11.5"
        semantics="secondary"
        @click="toggle"
      >
        <IconGoSorting />
      </NatButton>
    </template>
    <div class="p-2.5 space-y-2.5 min-w-140px bg-white rounded-5px">
      <div
        v-for="column in cols"
        :key="column.key"
        class="cursor-pointer flex items-center"
        @click="changeSorting(column.key)"
      >
        <SortingIcon
          class="mr-2"
          :direction="sortingsMap[column.key]?.sorting.direction"
          :sortingIndex="getSortingIndex(column)"
        />
        {{ column.name }}
      </div>
    </div>
  </NatDropdown>
</template>
