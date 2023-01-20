import { MaybeRef } from '@vueuse/core'
import { Ref } from 'vue'

import { DropSection } from '@/ui/DragAndDrop/dragAndDropManager'
import { isFunction } from '@/utils/typecheck'

export interface AfterDropData<DragModel> {
  src: DragModel
  trg: DragModel
  srcIndex: number
  trgIndex: number
  srcItems: DragModel[]
  trgItems: DragModel[]
  isDroppedAfter: boolean
  isDroppedBefore: boolean
}

export type AfterDropHandler<DragModel = any> = (data: AfterDropData<DragModel>) => void

export type CanDrop<DragModel> = (srcModel: DragModel, trgModel: DragModel, dropSection: DropSection) => boolean
export type OnDrop<DragModel> = (srcModel: DragModel, trgModel: DragModel, dropSection: DropSection) => void
export interface UseDragAndDropHandlersResult<DragModel> {
  canDrop: CanDrop<DragModel>
  onDrop: OnDrop<DragModel>
}

export interface UseDragAndDropHandlersOptions<DragModel> {
  isEnabled?: MaybeRef<boolean | undefined>
  keyGetter?: (model: DragModel) => string | number | undefined
  afterDrop?: AfterDropHandler<DragModel>
}

export const useDragAndDropHandlers = <DragModel>(itemsOrItemsGetter: Ref<DragModel[]> | ((model: DragModel) => DragModel[]), options: UseDragAndDropHandlersOptions<DragModel> = {}): UseDragAndDropHandlersResult<DragModel> => {
  const {
    isEnabled: maybeRefIsEnabled = true,
    keyGetter = (model) => (model as any).id as number | string,
    afterDrop = ({ src, srcIndex, trgIndex, srcItems, trgItems, isDroppedAfter }) => {
      if (srcItems === trgItems) {
        srcItems.splice(srcIndex, 1)
        if (srcIndex < trgIndex) trgIndex -= 1
        if (isDroppedAfter) trgIndex += 1
        trgItems.splice(trgIndex, 0, src)
      } else {
        srcItems.splice(srcIndex, 1)
        trgItems.splice(trgIndex, 0, src)
      }
    }
  } = options

  const canDrop = (srcModel: DragModel, trgModel: DragModel, dropSection: DropSection) => {
    const isEnabled = unref(maybeRefIsEnabled)
    if (!isEnabled) return false
    const [srcId, trgId] = [keyGetter(srcModel), keyGetter(trgModel)]
    if (srcId === trgId) return false
    const [srcItems, trgItems] = isFunction(itemsOrItemsGetter)
      ? [itemsOrItemsGetter(srcModel), itemsOrItemsGetter(trgModel)]
      : [itemsOrItemsGetter.value, itemsOrItemsGetter.value]
    const srcIndex = srcItems.findIndex((item) => keyGetter(item) === srcId)
    const trgIndex = trgItems.findIndex((item) => keyGetter(item) === trgId)
    return srcItems !== trgItems || srcIndex !== trgIndex + (dropSection.isAtBottom ? 1 : -1)
  }

  const onDrop = (srcModel: DragModel, trgModel: DragModel, dropSection: DropSection) => {
    const isEnabled = unref(maybeRefIsEnabled)
    if (!isEnabled) return false
    const [srcId, trgId] = [keyGetter(srcModel), keyGetter(trgModel)]
    const [srcItems, trgItems] = isFunction(itemsOrItemsGetter)
      ? [itemsOrItemsGetter(srcModel), itemsOrItemsGetter(trgModel)]
      : [itemsOrItemsGetter.value, itemsOrItemsGetter.value]
    const srcIndex = srcItems.findIndex((item) => keyGetter(item) === srcId)
    const trgIndex = Math.max(0, trgItems.findIndex((item) => keyGetter(item) === trgId))
    const src = srcItems[srcIndex]
    const trg = trgItems[trgIndex]
    if (afterDrop) {
      const isDroppedAfter = dropSection.isAtBottom === true
      afterDrop({ src, trg, srcIndex, trgIndex, srcItems, trgItems, isDroppedAfter, isDroppedBefore: !isDroppedAfter })
    }
  }

  return { canDrop, onDrop }
}
