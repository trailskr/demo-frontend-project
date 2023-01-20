<script setup lang="ts">
  import { themeColors } from '@/themeColors'
  import { Column, ColumnDef, DataGridRow, DataGridRowKeyGetter, makeRowKeyGetter, mapToColumn } from '@/ui/DataGrid/dataGrid'
  import { AfterDropHandler, useDragAndDropHandlers } from '@/use/useDragAndDropHandlers'
  import { ChangeSortingFn, SortingItem, SortingsMap } from '@/use/useSorting'
  import { formatColor } from '@/utils/color'
  import { isFunction } from '@/utils/typecheck'
  import { noop } from '@/utils/utils'

  interface Props {
    rows: DataGridRow[]
    rowKey: string | DataGridRowKeyGetter
    cols: ColumnDef[]
    isLoading?: boolean
    isFetching?: boolean
    tiling?: boolean
    rowBgColor?: string | ((row: DataGridRow) => string | undefined)

    sortings?: SortingItem[]
    sortingsMap?: SortingsMap
    changeSorting?: ChangeSortingFn

    hasSelection?: boolean
    selectionRight?: boolean

    hasDragAndDrop?: boolean
    afterDrop?: AfterDropHandler

    // selection
    isSelected?: (key: any) => boolean
    setSelected?: (key: any, isSelected: boolean) => void
    isAllSelected?: boolean
    setSelectedAll?: (isSelected: boolean) => void

    onRowClick?: (event: Event, row: DataGridRow) => void
  }

  const props = withDefaults(defineProps<Props>(), {
    sortings: () => [],
    sortingsMap: () => ({}),
    changeSorting: noop,
    isSelected: () => false,
    setSelected: noop,
    setSelectedAll: noop,
    onRowClick: noop,
    rowBgColor: formatColor(themeColors.background, 'var(--un-bg-opacity)')
  })

  const rowKeyGetter = computed((): DataGridRowKeyGetter => makeRowKeyGetter(props.rowKey))

  const columns = computed((): Column[] => props.cols.map(mapToColumn))
  const firstColumn = computed(() => columns.value[0])
  const lastColumn = computed(() => columns.value[columns.value.length - 1])

  const middleColumns = computed(() => columns.value.slice(1, -1))

  const { canDrop, onDrop } = useDragAndDropHandlers<DataGridRow>(computed(() => props.rows), {
    isEnabled: computed(() => props.hasDragAndDrop),
    afterDrop: props.afterDrop
  })
</script>

<template>
  <div class="flex flex-col gap-2 relative">
    <NatDragAndDrop
      v-for="(row, rowIndex) in rows"
      :key="rowKeyGetter(row)"
      v-slot="{ refHandler, status }"
      context="document"
      :modelValue="row"
      :canDrag="hasDragAndDrop"
      :canDrop="canDrop"
      clone
      splitZoneVertically
      @natDrop="onDrop"
    >
      <section
        :ref="refHandler"
        class="rounded-5px p-2.5 flex flex-col gap-2 relative"
        :class="tiling ? null : 'bg-white'"
        :style="{ background: isFunction(rowBgColor) ? rowBgColor(row) : rowBgColor }"
        @click="onRowClick($event, row)"
      >
        <NatLinearProgress
          v-if="rowIndex === 0 && isFetching"
          class="top-0 left-0"
        />
        <div
          v-if="status.isAtTop"
          class="absolute pointer-events-none left-0 -top-1.25 w-full border-b-2 border-primary"
        />
        <div
          v-if="status.isAtBottom"
          class="absolute pointer-events-none left-0 -bottom-1.25 w-full border-b-2 border-primary"
        />
        <div class="flex items-center justify-between">
          <div class="flex items-center flex-auto">
            <div
              v-if="hasSelection && !selectionRight"
              class="-ml-2.5"
            >
              <slot
                name="select"
                :row="row"
              >
                <NatCheckbox
                  :modelValue="isSelected(rowKeyGetter(row))"
                  @update:modelValue="setSelected(rowKeyGetter(row), $event)"
                />
              </slot>
            </div>
            <div v-if="hasDragAndDrop">
              <NatDragControl v-slot="{ refControlHandler }">
                <slot
                  name="dragHaldler"
                  refControlHandler="refControlHandler"
                >
                  <div
                    :ref="refControlHandler"
                    class="flex cursor-move touch-none gap-2"
                  >
                    <IconOouiDraggable
                      class="text-secondary"
                    />
                    <Component
                      :is="firstColumn.component"
                      v-if="firstColumn.component"
                      :class="firstColumn.cellClass"
                      v-bind="firstColumn.componentProps"
                      :column="firstColumn"
                      :modelValue="firstColumn.getter(row)"
                      :rowIndex="rowIndex"
                      @update:modelValue="firstColumn.setter?.(row, $event)"
                    />
                    <div
                      v-else
                      :class="firstColumn.cellClass"
                    >
                      {{ firstColumn.getter(row) }}
                    </div>
                  </div>
                </slot>
              </NatDragControl>
            </div>
            <div
              v-else
              class="flex-auto"
            >
              <Component
                :is="firstColumn.component"
                v-if="firstColumn.component"
                :class="firstColumn.cellClass"
                v-bind="firstColumn.componentProps"
                :column="firstColumn"
                :modelValue="firstColumn.getter(row)"
                @update:modelValue="firstColumn.setter?.(row, $event)"
              />
              <div
                v-else
                :class="firstColumn.cellClass"
              >
                {{ firstColumn.getter(row) }}
              </div>
            </div>
          </div>
          <div class="hidden sm:block">
            <Component
              :is="lastColumn.component"
              v-if="lastColumn.component"
              :class="lastColumn.cellClass"
              v-bind="lastColumn.componentProps"
              :column="lastColumn"
              :modelValue="lastColumn.getter(row)"
              @update:modelValue="lastColumn.setter?.(row, $event)"
            />
            <div
              v-else
              :class="lastColumn.cellClass"
            >
              {{ lastColumn.getter(row) }}
            </div>
          </div>
          <div
            v-if="hasSelection && selectionRight"
            class="-mr-2.5"
          >
            <slot
              name="select"
              :row="row"
            >
              <NatCheckbox
                :modelValue="isSelected(rowKeyGetter(row))"
                @update:modelValue="setSelected(rowKeyGetter(row), $event)"
              />
            </slot>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center space-y-2">
          <div
            v-for="col in middleColumns"
            :key="col.key"
            class="flex-1"
          >
            <div class="text-2.75 text-tertiary py-1">
              <Component
                :is="col.headerComponent"
                v-if="col.headerComponent"
                v-bind="lastColumn.headerComponentProps"
                :column="col"
              />
              <template v-else>
                {{ col.name }}
              </template>
            </div>
            <Component
              :is="col.component"
              v-if="col.component"
              :class="col.cellClass"
              v-bind="col.componentProps"
              :column="col"
              :modelValue="col.getter(row)"
              @update:modelValue="col.setter?.(row, $event)"
            />
            <div
              v-else
              :class="col.cellClass"
            >
              {{ col.getter(row) }}
            </div>
          </div>
        </div>
        <div
          v-if="!lastColumn.hideInXSmall"
          class="sm:hidden border-t-1 border-substrate pt-2.5"
        >
          <Component
            :is="lastColumn.component"
            v-if="lastColumn.component"
            :class="lastColumn.cellClass"
            v-bind="lastColumn.componentProps"
            :column="lastColumn"
            :modelValue="lastColumn.getter(row)"
            @update:modelValue="lastColumn.setter?.(row, $event)"
          />
          <div
            v-else
            :class="lastColumn.cellClass"
          >
            {{ lastColumn.getter(row) }}
          </div>
        </div>
      </section>
    </NatDragAndDrop>
    <section
      v-if="isLoading"
      class="bg-white rounded-5px relative"
      :class="{ 'min-h-64': isLoading }"
    >
      <NatSpinner
        class="rounded-5px"
        wrap
      />
    </section>
  </div>
</template>
