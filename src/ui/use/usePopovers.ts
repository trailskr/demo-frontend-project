import { Ref } from 'vue'

import { removeElementFromArray } from '@/utils/utils'

export type PopoverElement = Ref<HTMLElement | null | undefined>

const allPopovers = ref<PopoverElement[]>([])

export const addPopoverChildElement = (child: PopoverElement) => {
  allPopovers.value.push(child)
  onBeforeUnmount(() => {
    removeElementFromArray(allPopovers.value, child)
  })
  return computed(() => {
    const index = allPopovers.value.indexOf(child)
    return allPopovers.value.slice(index + 1)
  })
}
