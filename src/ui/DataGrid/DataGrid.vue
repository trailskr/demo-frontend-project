<script setup lang="ts">
  import { themeColors } from '@/themeColors'
  import { AfterDropHandler, useDragAndDropHandlers } from '@/use/useDragAndDropHandlers'
  import { ChangeSortingFn, SortingItem, SortingsMap } from '@/use/useSorting'
  import { formatColor } from '@/utils/color'
  import { isFunction } from '@/utils/typecheck'
  import { noop } from '@/utils/utils'

  import { Column, ColumnDef, DataGridRow, DataGridRowKeyGetter, makeRowKeyGetter, mapToColumn } from './dataGrid'

  interface Props {
    rows: DataGridRow[]
    rowKey: string | DataGridRowKeyGetter
    cols: ColumnDef[]
    isLoading?: boolean
    isFetching?: boolean
    showHeader?: boolean
    condencedHeader?: boolean
    tiling?: boolean
    rowBgColor?: string | ((row: DataGridRow) => string | undefined)

    sortings?: SortingItem[]
    sortingsMap?: SortingsMap
    changeSorting?: ChangeSortingFn
    selectionRight?: boolean

    hasSelection?: boolean
    hasAllSelection?: boolean

    hasDragAndDrop?: boolean
    afterDrop?: AfterDropHandler

    // selection
    isSelected?: (key: any) => boolean
    setSelected?: (key: any, isSelected: boolean) => void
    isAllSelected?: boolean
    isAnySelected?: boolean
    setSelectedAll?: (isSelected: boolean) => void
    clearSelection?: () => void
    onRowClick?: (event: Event, row: DataGridRow) => void
    isRowClickable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showHeader: true,
    sortings: () => [],
    sortingsMap: () => ({}),
    changeSorting: noop,
    isSelected: () => false,
    setSelected: noop,
    setSelectedAll: noop,
    onRowClick: noop,
    rowBgColor: formatColor(themeColors.background, 'var(--un-bg-opacity)')
  })

  const hasAnySelection = computed(() => props.hasSelection || props.hasAllSelection)

  const rowKeyGetter = computed((): DataGridRowKeyGetter => makeRowKeyGetter(props.rowKey))

  const columns = computed((): Column[] => props.cols.map(mapToColumn))

  const getCellClass = (index: number): string => {
    return index === 0 && (hasAnySelection.value || props.hasDragAndDrop)
      ? 'pr-1'
      : index === columns.value.length - 1
        ? 'pl-3.5 pr-1.25'
        : 'px-3.5'
  }

  const getSortingIndex = (col: Column): number | undefined => {
    if (props.sortings.length <= 1) return undefined
    const sorting = props.sortingsMap[col.key]
    return sorting ? sorting.index + 1 : undefined
  }

  const { canDrop, onDrop } = useDragAndDropHandlers<DataGridRow>(computed(() => props.rows), {
    isEnabled: computed(() => props.hasDragAndDrop),
    afterDrop: props.afterDrop
  })

  const isDragging = ref(false)
</script>

<template>
  <GridTable
    :isLoading="isLoading"
    :tiling="tiling"
  >
    <GridHeader :isFetching="isFetching">
      <GridHeaderRow v-if="showHeader">
        <GridHeaderCell
          v-if="hasAnySelection && !selectionRight"
          class="pl-1 w-10"
          :class="condencedHeader ? 'py-1' : 'py-3.75'"
        >
          <slot
            v-if="hasAnySelection || (isAnySelected && clearSelection)"
            name="select-all"
            :clearSelection="clearSelection"
            :setSelectedAll="setSelectedAll"
            :isAllSelected="isAllSelected"
          >
            <NatCheckbox
              v-if="hasAllSelection"
              class="-my-10"
              :modelValue="isAnySelected"
              :indeterminate="isAllSelected == null"
              @update:modelValue="setSelectedAll($event)"
            />
            <NatCheckbox
              v-else-if="isAnySelected && clearSelection"
              class="-my-10"
              :modelValue="isAnySelected"
              :indeterminate="isAnySelected"
              @update:modelValue="clearSelection?.()"
            />
          </slot>
        </GridHeaderCell>
        <GridHeaderCell
          v-if="hasDragAndDrop"
          class="pl-1 w-10"
          :class="condencedHeader ? 'py-1' : 'py-3.75'"
        />
        <GridHeaderCell
          v-for="(col, index) in columns"
          :key="col.key"
          :class="[getCellClass(index), condencedHeader ? 'py-1' : 'py-3.75']"
          :isSortable="col.isSortable"
          :direction="sortingsMap[col.key]?.sorting.direction"
          :sortingIndex="getSortingIndex(col)"
          @sort="changeSorting(col.key)"
        >
          <Component
            :is="col.headerComponent"
            v-if="col.headerComponent"
            v-bind="col.headerComponentProps"
            :column="col"
          />
          <template v-else>
            {{ col.name }}
          </template>
        </GridHeaderCell>
        <GridHeaderCell
          v-if="hasAnySelection && selectionRight"
          class="pr-1 w-10"
          :class="condencedHeader ? 'py-1' : 'py-3.75'"
        >
          <slot
            v-if="hasAnySelection || (isAnySelected && clearSelection)"
            name="select-all"
            :clearSelection="clearSelection"
            :setSelectedAll="setSelectedAll"
            :isAllSelected="isAllSelected"
          >
            <NatCheckbox
              v-if="hasAllSelection"
              class="-my-10"
              :modelValue="isAllSelected === true"
              :indeterminate="isAllSelected == null"
              @update:modelValue="setSelectedAll($event)"
            />
            <NatCheckbox
              v-else-if="isAnySelected && clearSelection"
              class="-my-10"
              :modelValue="isAnySelected"
              :indeterminate="isAnySelected"
              @update:modelValue="clearSelection?.()"
            />
          </slot>
        </GridHeaderCell>
      </GridHeaderRow>
    </GridHeader>
    <GridBody>
      <template
        v-for="(row, rowIndex) in rows"
        :key="rowKeyGetter(row)"
      >
        <NatDragAndDrop
          v-slot="{ refHandler, status }"
          context="document"
          :modelValue="row"
          :canDrag="hasDragAndDrop"
          :canDrop="canDrop"
          clone
          splitZoneVertically
          @natDrop="onDrop"
          @natDragStart="isDragging = true"
          @natDragEnd="isDragging = false"
        >
          <GridBodyRow
            :ref="refHandler"
            :isHoverable="!isDragging"
            :class="{ 'cursor-pointer': isRowClickable, 'touch-none': hasDragAndDrop }"
            :style="{ '--row-bg': isFunction(rowBgColor) ? rowBgColor(row) : rowBgColor }"
            @click="onRowClick($event, row)"
          >
            <GridBodyCell
              v-if="hasAnySelection && !selectionRight"
              class="pl-1 w-10 relative"
            >
              <slot
                v-if="hasSelection"
                name="select"
                :row="row"
              >
                <NatCheckbox
                  :modelValue="isSelected(rowKeyGetter(row))"
                  @update:modelValue="setSelected(rowKeyGetter(row), $event)"
                />
              </slot>
              <div
                v-if="status.isAtTop"
                class="absolute pointer-events-none left-0 -top-2px w-full border-b-2 border-primary"
              />
              <div
                v-if="status.isAtBottom"
                class="absolute pointer-events-none left-0 -bottom-2px w-full border-b-2 border-primary"
              />
            </GridBodyCell>
            <GridBodyCell
              v-if="hasDragAndDrop"
              class="pl-1 w-10 relative"
            >
              <NatDragControl v-slot="{ refControlHandler }">
                <slot
                  name="dragHaldler"
                  refControlHandler="refControlHandler"
                >
                  <IconOouiDraggable
                    :ref="refControlHandler"
                    class="text-secondary cursor-move touch-none"
                  />
                </slot>
              </NatDragControl>
              <div
                v-if="status.isAtTop"
                class="absolute pointer-events-none left-0 -top-2px w-full border-b-2 border-primary"
              />
              <div
                v-if="status.isAtBottom"
                class="absolute pointer-events-none left-0 -bottom-2px w-full border-b-2 border-primary"
              />
            </GridBodyCell>
            <GridBodyCell
              v-for="(col, index) in columns"
              :key="col.key"
              :class="[col.cellClass, col.bigCellClass, getCellClass(index), 'relative']"
            >
              <Component
                :is="col.component"
                v-if="col.component"
                v-bind="col.componentProps"
                :column="col"
                :modelValue="col.getter(row)"
                :rowIndex="rowIndex"
                @update:modelValue="col.setter?.(row, $event)"
              />
              <template v-else>
                {{ col.getter(row) }}
              </template>
              <div
                v-if="status.isAtTop"
                class="absolute pointer-events-none left-0 -top-2px w-full border-b-2 border-primary"
              />
              <div
                v-if="status.isAtBottom"
                class="absolute pointer-events-none left-0 -bottom-2px w-full border-b-2 border-primary"
              />
            </GridBodyCell>
            <GridBodyCell
              v-if="hasAnySelection && selectionRight"
              class="pr-1 w-10 relative"
            >
              <slot
                v-if="hasSelection"
                name="select"
                :row="row"
              >
                <NatCheckbox
                  :modelValue="isSelected(rowKeyGetter(row))"
                  @update:modelValue="setSelected(rowKeyGetter(row), $event)"
                />
              </slot>
              <div
                v-if="status.isAtTop"
                class="absolute pointer-events-none left-0 -top-2px w-full border-b-2 border-primary"
              />
              <div
                v-if="status.isAtBottom"
                class="absolute pointer-events-none left-0 -bottom-2px w-full border-b-2 border-primary"
              />
            </GridBodyCell>
          </GridBodyRow>
          <tr
            v-if="tiling"
            class="invisible h-1.5"
          >
            <td colspan="10000" />
          </tr>
        </NatDragAndDrop>
      </template>
    </GridBody>
  </GridTable>
</template>
