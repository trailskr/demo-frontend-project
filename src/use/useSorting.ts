import { MaybeRef } from '@vueuse/core'
import { Ref } from 'vue'

export enum SortingDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export interface SortingItem {
  key: string
  direction: SortingDirection
}

export type Key = number | string

export type SortingsMap = Record<string, {sorting: SortingItem, index: number} | undefined>
export type ChangeSortingFn = (key: string) => void

export interface UseSortingResult {
  sorting: Ref<SortingItem | undefined>
  sortings: Ref<SortingItem[]>
  sortingsMap: Ref<SortingsMap>
  changeSorting: ChangeSortingFn
}

export const useSorting = (allowMultiSort: MaybeRef<boolean> = false, defaultSort?: SortingItem): UseSortingResult => {
  const sortings = ref<SortingItem[]>(defaultSort ? [defaultSort] : [])
  const sortingsMap = computed(() => {
    return sortings.value.reduce((result, sorting, index) => {
      result[sorting.key] = { sorting, index }
      return result
    }, {} as SortingsMap)
  })

  const control = useKeyModifier('Control')
  const allowMultiSortComputed = computed(() => unref(allowMultiSort) && control.value)

  const changeSorting: ChangeSortingFn = (key: string) => {
    const sortingIndex = sortings.value.findIndex((item) => item.key === key)
    const sorting = sortingIndex === -1 ? undefined : sortings.value[sortingIndex]
    if (sorting) {
      if (sorting.direction === SortingDirection.Asc) {
        sorting.direction = SortingDirection.Desc
        if (!allowMultiSortComputed.value) sortings.value = [sorting]
      } else {
        sortings.value.splice(sortingIndex, 1)
      }
    } else {
      if (allowMultiSortComputed.value) {
        sortings.value.push({ key, direction: SortingDirection.Asc })
      } else {
        sortings.value = [{ key, direction: SortingDirection.Asc }]
      }
    }
  }

  const sorting = computed(() => sortings.value[0])

  return { sorting, sortings, sortingsMap, changeSorting }
}
