<script setup lang="ts">
  import { ColumnDef, DataGridRow, DataGridRowKeyGetter } from '@/ui/DataGrid/dataGrid'
  import { AfterDropHandler } from '@/use/useDragAndDropHandlers'
  import { useScreenBreakpoints } from '@/use/useScreenBreakpoints'
  import { SortingItem, SortingsMap, ChangeSortingFn } from '@/use/useSorting'
  import { noop } from '@/utils/utils'

  interface Props {
    rows: DataGridRow[]
    rowKey: string | DataGridRowKeyGetter
    smallCols: ColumnDef[]
    bigCols: ColumnDef[]
    isLoading?: boolean
    isFetching?: boolean
    showHeader?: boolean
    condencedHeader?: boolean
    tiling?: boolean
    rowBgColor?: string | ((row: DataGridRow) => string | undefined)

    sortings?: SortingItem[]
    sortingsMap?: SortingsMap
    changeSorting?: ChangeSortingFn

    hasDragAndDrop?: boolean
    afterDrop?: AfterDropHandler

    hasSelection?: boolean
    hasAllSelection?: boolean
    selectionRight?: boolean

    // selection
    isSelected?: (key: any) => boolean
    setSelected?: (key: any, isSelected: boolean) => void
    isAllSelected?: boolean
    isAnySelected?: boolean
    setSelectedAll?: (isSelected: boolean) => void
    clearSelection?: () => void

    onRowClick?: (row: DataGridRow) => void
    isRowClickable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showHeader: true,
    onRowClick: noop
  })

  const { t } = useI18n()

  const screen = useScreenBreakpoints()
  const onRowClickHandler = (e: Event, row: DataGridRow) => {
    if (e.composedPath().some((element) => ['BUTTON', 'A', 'INPUT'].some((it) => (element as HTMLElement).tagName === it))) {
      return
    }
    props.onRowClick(row)
  }
</script>

<script lang="ts">
  export default defineComponent({
    inheritAttrs: false
  })
</script>

<template>
  <DataGrid
    v-if="screen.lg"
    v-bind="$attrs"
    :rows="rows"
    :rowKey="rowKey"
    :cols="bigCols"
    :isLoading="isLoading"
    :isFetching="isFetching"
    :showHeader="showHeader"
    :condencedHeader="condencedHeader"
    :tiling="tiling"
    :rowBgColor="rowBgColor"

    :sortings="sortings"
    :sortingsMap="sortingsMap"
    :changeSorting="changeSorting"

    :hasDragAndDrop="hasDragAndDrop"
    :afterDrop="afterDrop"

    :hasSelection="hasSelection"
    :hasAllSelection="hasAllSelection"
    :isSelected="isSelected"
    :setSelected="setSelected"
    :isAllSelected="isAllSelected"
    :isAnySelected="isAnySelected"
    :setSelectedAll="setSelectedAll"
    :clearSelection="clearSelection"
    :selectionRight="selectionRight"
    :onRowClick="onRowClickHandler"
    :isRowClickable="isRowClickable"
  />
  <SmallGrid
    v-else
    v-bind="$attrs"
    :rows="rows"
    :rowKey="rowKey"
    :cols="smallCols"
    :isLoading="isLoading"
    :isFetching="isFetching"
    :tiling="tiling"
    :rowBgColor="rowBgColor"

    :sortings="sortings"
    :sortingsMap="sortingsMap"
    :changeSorting="changeSorting"

    :hasDragAndDrop="hasDragAndDrop"
    :afterDrop="afterDrop"

    :hasSelection="hasSelection"
    :isSelected="isSelected"
    :setSelected="setSelected"
    :isAllSelected="isAllSelected"
    :setSelectedAll="setSelectedAll"
    :selectionRight="selectionRight"
    :onRowClick="onRowClickHandler"
  />
  <div
    v-if="!rows.length && !isLoading && !isFetching"
    class="text-4.5 font-semibold py-5 w-full flex justify-center items-center bg-white"
  >
    <slot name="noData">
      {{ t('no-records-found') }}.
    </slot>
  </div>
</template>
