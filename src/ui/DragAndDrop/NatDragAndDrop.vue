<script setup lang="ts">
/**
 * @description Usage
 * <CmvDragAndDrop canDrag v-slot="{ refHandler, status }">
 *   <div
 *     :ref="refHandler"
 *     style="touch-events: none !important"                     // important to work with touch device
 *     :class="status.isDragInProgress && 'drag-in-progress'"
 *   >
 *   </div>
 * </CmvDragAndDrop>
 *
 * Or
 *
 * <CmvDragAndDrop canDrag v-slot="{ refHandler, status }">
 *   <div
 *     :ref="refHandler"
 *     :class="status.isDragInProgress && 'drag-in-progress'"
 *   >
 *     <NatDragControl v-slot="{ refControlHandler }">
 *       Some content
 *       <div
 *         :ref="refControlHandler"
 *         style="touch-events: none !important"                  // important to work with touch device
 *         class="text-secondary cursor-move"
 *       >
 *         Drag me pleaase
 *       </div>
 *    </NatDragControl>
 *   </div>
 * </CmvDragAndDrop>
 */

  import { ref, computed, getCurrentInstance, provide } from 'vue'

  import { useForwardTemplateRef } from '@/use/useForwardTemplateRef'
  import { isArray } from '@/utils/typecheck'

  import type { DragElement, DragState, CmvDragAndDrop, DropSection, DragCursorPositions, VueComponent, DragAndDropStatus } from './dragAndDropManager'
  import { draggablePropertyName, dragAndDropKey } from './dragAndDropManager'

  interface Props {
    /**
    * Value that binds the moving component and the moving zone to the data.
    * This value will be passed to all tracking hooks to understand what this element is
    */
    modelValue?: any

    /**
     * The context is needed to separate independent Drag And Drop elements
     * that can be mixed only with each other, but not with each other.
     */
    context?: string

    /**
     * Should the drop zone be divided into sections for which canDropFn will
     * be processed separately and dragOver will be triggered
     */
    splitZoneVertically?: boolean
    splitZoneHorizontally?: boolean

    /** Determines whether the component is draggable */
    canDrag?: boolean | ((selfValue: any) => boolean)

    /** Determines whether a draggable value can be dropped */
    canDrop?: boolean | ((srcValue: any, trgValue: any, dropSection: DropSection) => boolean)

    /**
     * The function of cloning an element to create a movable avatar
     * false - avatar creation is not required, visual movement, element
     * if necessary, you can do it manually.
     * Otherwise, a function must be passed that will make a clone of the element.
     */
    clone?: boolean | ((el: DragElement) => DragElement)

    /** The class will be added to the created avatar */
    avatarClassName?: string | string[]

    /**
     * Enables avatar movement animation
     * (rotates depending on the speed of movement)
     */
    animateAvatar?: boolean

    /** The class or classes that will be added to the body during the active move */
    bodyClassName?: string | string[]
  }

  const props = withDefaults(defineProps<Props>(), {
    context: 'default',
    avatarClassName: 'nat-drag-and-drop-avatar',
    animateAvatar: false,
    splitZoneVertically: false,
    splitZoneHorizontally: false
  })

  interface Emits {
    /** Called when throwing a value that has been approved by the canDrop check */
    (e: 'natDrop', draggedValue: any, selfValue: any, dropSection: DropSection): void
    /** Called when it is possible to throw a value that has been approved by the canDrop check */
    (e: 'natDragOver', draggedValue: any, selfValue: any, dropSection: DropSection): void
    /** The method is called at the beginning of a move approved by the check, triggered before onDrag */
    (e: 'natDragStart', positions: DragCursorPositions): void
    /** The method is called whenever the cursor is moved during the move */
    (e: 'natDragMove', positions: DragCursorPositions): void
    /**
     * The method is called when the move is completed or canceled, it is triggered after onDrop,
     * as well as after all other event listeners via setTimeout
     */
    (e: 'natDragEnd', positions: DragCursorPositions): void
  }

  const emit = defineEmits<Emits>()

  const selfInstance = getCurrentInstance()

  const { ref: el, refFn: refHandler } = useForwardTemplateRef((element) => {
    if (element) {
      (element as DragElement)[draggablePropertyName] = selfInstance as unknown as VueComponent<CmvDragAndDrop>
    }
  })

  const refH = refHandler as (el: any) => void

  const numDragControls = ref(0)

  const dragState = ref<DragState>()

  const isDragInProgress = ref(false)
  const isDropPossible = ref<boolean>()
  const currentDropSection = ref<DropSection>({})

  const isDraggable = computed(() => !!props.canDrag)
  const isDropZone = computed(() => !!props.canDrop)

  const onStart = (state: DragState): void => {
    dragState.value = state
    if (el.value) el.value.style.touchAction = 'none'
  }

  const canDragFn = (): boolean => {
    const trg = props.modelValue
    if (typeof props.canDrag === 'function') {
      return props.canDrag(trg)
    } else {
      return isDraggable.value
    }
  }

  const canDropFn = (draggedValue: any, dropSection: DropSection): boolean => {
    const selfValue = props.modelValue
    if (typeof props.canDrop === 'function') {
      return props.canDrop(draggedValue, selfValue, dropSection)
    } else {
      return isDropZone.value
    }
  }

  const dragOver = (draggedValue: any, dropSection: DropSection): void => {
    const selfValue = props.modelValue
    currentDropSection.value = dropSection
    emit('natDragOver', draggedValue, selfValue, dropSection)
  }

  const dragLeave = (): void => {
    currentDropSection.value = {}
  }

  const drop = (draggedValue: any, dropSection: DropSection): void => {
    if (canDropFn(draggedValue, dropSection)) {
      const selfValue = props.modelValue
      currentDropSection.value = dropSection
      emit('natDrop', draggedValue, selfValue, dropSection)
      dragLeave()
    }
  }

  const makeAvatar = (): DragElement => {
    if (!el.value) {
      throw new Error(
        'ref element is not defined, are you used ref argument in render function?'
      )
    }

    if (props.clone === false) {
      return el.value as DragElement
    }
    const classNames = isArray(props.avatarClassName) ? props.avatarClassName : [props.avatarClassName]
    const clone =
      typeof props.clone === 'function'
        ? props.clone(el.value as DragElement)
        : (el.value.cloneNode(true) as DragElement)

    clone.classList.add(...classNames)

    let rect: DOMRect
    if (getComputedStyle(el.value).display === 'contents') {
      const oldDisplay = el.value.style.display
      el.value.style.display = 'flex'
      rect = el.value.getBoundingClientRect()
      el.value.style.display = oldDisplay
    } else {
      rect = el.value.getBoundingClientRect()
    }

    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.top = `${rect.top}px`
    clone.style.left = `${rect.left}px`
    clone.style.position = 'fixed'
    clone.style.userSelect = 'none'
    clone.style.willChange = 'transform'
    clone.style.pointerEvents = 'none'

    return clone
  }

  const positions = computed<DragCursorPositions>(() => {
    const start = dragState.value?.start
    const move = dragState.value?.progress?.move
    const diff = start && move
      ? {
        x: move.x - start.x,
        y: move.y - start.y
      }
      : {
        x: 0,
        y: 0
      }

    return { start, move, diff }
  })

  const handleMove = (): void => {
    emit('natDragMove', positions.value)
  }

  const dragStart = (): void => {
    if (!isDragInProgress.value) {
      isDragInProgress.value = true
      emit('natDragStart', positions.value)
    }
  }

  const dragEnd = (): void => {
    if (isDragInProgress.value) {
      // We ensure that the progress reset and the onDragEnded event
      // occur after all other click events,
      // so that you can learn from click events
      // about the presence of the current migration process.
      setTimeout(() => {
        dragState.value = undefined
        isDragInProgress.value = false
        emit('natDragEnd', positions.value)
      })
    }
  }

  const setDropPossibility = (possibility: boolean | undefined): void => {
    if (isDropPossible.value !== possibility) {
      isDropPossible.value = possibility
    }
  }

  provide(dragAndDropKey, selfInstance as unknown as VueComponent<CmvDragAndDrop>)

  const status = computed((): DragAndDropStatus => ({
    isDraggable: isDraggable.value,
    isDropZone: isDropZone.value,
    isDragInProgress: isDragInProgress.value,
    isDropPossible: isDropPossible.value,
    ...currentDropSection.value
  }))

  defineExpose(reactive({
    el,
    isDraggable,
    isDropZone,
    animateAvatar: props.animateAvatar,
    context: props.context,
    modelValue: props.modelValue,
    bodyClassName: props.bodyClassName,
    numDragControls,
    splitZoneVertically: props.splitZoneVertically,
    splitZoneHorizontally: props.splitZoneHorizontally,
    dragState,
    onStart,
    canDragFn,
    canDropFn,
    dragOver,
    dragLeave,
    drop,
    makeAvatar,
    handleMove,
    dragStart,
    dragEnd,
    setDropPossibility
  }))
</script>

<template>
  <slot
    :refHandler="refH"
    :status="status"
    :positions="positions"
  />
</template>

<style>
  .nat-drag-and-drop-avatar {
    opacity: 0.7
  }
</style>
