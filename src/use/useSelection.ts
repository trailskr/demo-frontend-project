import { Ref } from 'vue'

import { removeElementFromArray } from '@/utils/utils'

type SelectIdType = number | string

export interface UseSelectionResult<T extends SelectIdType = SelectIdType> {
  selected: Readonly<Ref<T[]>>
  isSelected: (id: T) => boolean
  setSelected: (id: T, isSelected: boolean) => void
  selectOne: (id: T, isSelected: boolean) => void
  isAllSelected: Readonly<Ref<boolean | undefined>>
  isAnySelected: Readonly<Ref<boolean | undefined>>
  setSelectedAll: (isSelected: boolean) => void
  toggleSelectedAll: () => void
  clearSelection: () => void
  setSelectedIds: (ids: T[]) => void
}

export const useSelection = <T extends SelectIdType = SelectIdType>(): UseSelectionResult<T> => {
  const allSelected = ref<boolean | undefined>(false)
  const selection = ref<T[]>([]) as Ref<T[]>
  const selectionSet = new Set<T>()
  const isAnySelected = computed(() => allSelected.value || selection.value.length > 0)

  const add = (id: T) => {
    if (selectionSet.has(id)) return
    selectionSet.add(id)
    selection.value.push(id)
  }

  const remove = (id: T) => {
    if (!selectionSet.has(id)) return
    selectionSet.delete(id)
    removeElementFromArray(selection.value, id)
  }

  const clear = () => {
    selectionSet.clear()
    selection.value = []
  }

  const isAllSelected = computed(() => {
    return allSelected.value
      ? true
      : selection.value.length > 0
        ? undefined
        : false
  })

  const isSelected = (id: T) => {
    return allSelected.value || selection.value.includes(id)
  }

  const setSelected = (id: T, selected: boolean) => {
    if (selected) {
      add(id)
    } else {
      remove(id)
    }
    allSelected.value = false
  }

  const selectOne = (id: T, selected: boolean) => {
    clear()
    if (selected) {
      add(id)
    }
    allSelected.value = false
  }

  const setSelectedAll = (selected: boolean) => {
    clear()
    allSelected.value = selected
  }

  const toggleSelectedAll = () => {
    setSelectedAll(!isAnySelected.value)
  }

  const clearSelection = () => {
    clear()
    allSelected.value = false
  }

  const setSelectedIds = (ids: T[]) => {
    ids.forEach(add)
  }

  return {
    selected: selection,
    isSelected,
    setSelected,
    selectOne,
    isAllSelected,
    isAnySelected,
    setSelectedAll,
    toggleSelectedAll,
    clearSelection,
    setSelectedIds
  }
}
