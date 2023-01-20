<script setup lang="ts">
  import { ComputedRef, Ref, WritableComputedRef } from 'vue'

  import { DragCursorPositions } from '@/ui/DragAndDrop/dragAndDropManager'
  import { clamp } from '@/utils/utils'

  interface Props {
    left: number
    top: number
    scrollWidth?: number
    scrollHeight?: number
    leftShift?: number
    topShift?: number
    clamp?: boolean
    clampShift?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    clamp: true,
    clampShift: 0,
    leftShift: 0,
    topShift: 0
  })

  interface Emits {
    (e: 'update:left', left: number): void
    (e: 'update:top', top: number): void
  }

  const emit = defineEmits<Emits>()

  const el: Ref<any> = ref(null)

  const viewWidth = ref(0)
  const viewHeight = ref(0)

  const scrollWidth = ref(0)
  const scrollHeight = ref(0)

  watch(() => props.scrollWidth, (width) => {
    if (width != null) scrollWidth.value = width
  }, { immediate: true })

  watch(() => props.scrollHeight, (height) => {
    if (height != null) scrollHeight.value = height
  }, { immediate: true })

  useResizeObserver(el, (entries) => {
    const entry = entries[0]
    const rect = entry.contentRect
    viewWidth.value = rect.width
    viewHeight.value = rect.height
    if (props.scrollWidth == null) scrollWidth.value = entry.target.scrollWidth
    if (props.scrollHeight == null) scrollHeight.value = entry.target.scrollHeight
  })

  const kx = computed(() => viewWidth.value / scrollWidth.value)
  const ky = computed(() => viewHeight.value / scrollHeight.value)

  const mapToView = (ref: Ref<number> | WritableComputedRef<number>, k: ComputedRef<number>): WritableComputedRef<number> => computed({
    get: (): number => ref.value * k.value,
    set: (v: number) => { ref.value = v / k.value }
  })

  const left = useVModel(props, 'left', emit)
  const top = useVModel(props, 'top', emit)

  const viewLeft = mapToView(left, kx)
  const viewTop = mapToView(top, ky)

  const viewRight = computed(() => kx.value * (scrollWidth.value - viewWidth.value - left.value))
  const viewBottom = computed(() => ky.value * (scrollHeight.value - viewHeight.value - top.value))

  const piD2 = Math.PI / 2
  /**
   * When view is scrolled out of bounds, wee need to add some size to the scrollbar to compensate that
   */
  const clampThumb = (v: number, from: number, to: number, oppositeV: number, viewSize: number): number => {
    const thumbSize = viewSize - v - oppositeV
    const k = oppositeV < 0
      ? Math.atan(-oppositeV / thumbSize) / piD2
      : 0 // k will be in range of [0, 1)
    return clamp(v + oppositeV * k, 0, viewSize)
  }

  const thumbLeft = computed(() => clampThumb(viewLeft.value, 0, viewWidth.value, viewRight.value, viewWidth.value))
  const thumbTop = computed(() => clampThumb(viewTop.value, 0, viewHeight.value, viewBottom.value, viewHeight.value))

  const thumbRight = computed(() => clampThumb(viewRight.value, 0, viewWidth.value, viewLeft.value, viewWidth.value))
  const thumbBottom = computed(() => clampThumb(viewBottom.value, 0, viewHeight.value, viewTop.value, viewHeight.value))

  const showThumbX = computed(() => thumbLeft.value !== 0 || thumbRight.value !== 0)
  const showThumbY = computed(() => thumbTop.value !== 0 || thumbBottom.value !== 0)

  let dragStartLeft = 0
  const isDragLeftInProgress = ref(false)

  const onStartLeft = () => {
    dragStartLeft = viewLeft.value
    isDragLeftInProgress.value = true
  }

  const onMoveLeft = (positions: DragCursorPositions) => {
    const l = dragStartLeft + positions.diff.x
    viewLeft.value = props.clamp ? clamp(l, 0 - props.clampShift * kx.value, (scrollWidth.value - viewWidth.value) * kx.value + props.clampShift) : l
  }

  const onEndLeft = () => {
    dragStartLeft = viewLeft.value
    isDragLeftInProgress.value = false
  }

  let dragStartTop = 0
  const isDragTopInProgress = ref(false)

  const onStartTop = () => {
    dragStartTop = viewTop.value
    isDragTopInProgress.value = true
  }

  const onMoveTop = (positions: DragCursorPositions) => {
    const t = dragStartTop + positions.diff.y
    viewTop.value = props.clamp ? clamp(t, 0 - props.clampShift * kx.value, (scrollHeight.value - viewHeight.value) * ky.value + props.clampShift) : t
  }

  const onEndTop = () => {
    dragStartTop = viewTop.value
    isDragTopInProgress.value = false
  }
</script>

<template>
  <div
    ref="el"
    class="relative"
  >
    <slot />
    <div
      class="absolute w-full h-16px transition-colors hover:bg-white hover:bg-opacity-30 select-none group_scrollx"
      :class="{ 'bg-white bg-opacity-30': isDragLeftInProgress }"
      :style="{ left: `${leftShift}px`, bottom: `-${topShift}px` }"
    >
      <NatDragAndDrop
        v-if="showThumbX"
        v-slot="{ refHandler, status }"
        canDrag
        context="scrollThumbX"
        @natDragStart="onStartLeft"
        @natDragMove="onMoveLeft"
        @natDragEnd="onEndLeft"
      >
        <div
          :ref="refHandler"
          class="absolute inset-y-0 touch-none"
          :style="{ left: `${thumbLeft}px`, right: `${thumbRight}px` }"
        >
          <div
            class="absolute rounded-full inset-x-0 bg-primary h-4px transition-colors top-6px group_scrollx-hover:h-6px group_scrollx-hover:top-5px"
            :class="{ 'h-6px top-5px': status.isDragInProgress }"
          />
        </div>
      </NatDragAndDrop>
    </div>
    <div
      v-if="showThumbY"
      class="absolute h-full w-16px transition-colors hover:bg-white hover:bg-opacity-30 select-none group_scrolly"
      :class="{ 'bg-white bg-opacity-30': isDragTopInProgress }"
      :style="{ top: `${topShift}px`, right: `-${leftShift}px` }"
    >
      <NatDragAndDrop
        v-slot="{ refHandler, status }"
        canDrag
        context="scrollThumbY"
        @natDragStart="onStartTop"
        @natDragMove="onMoveTop"
        @natDragEnd="onEndTop"
      >
        <div
          :ref="refHandler"
          class="absolute inset-x-0 touch-none"
          :style="{ top: `${thumbTop}px`, bottom: `${thumbBottom}px` }"
        >
          <div
            class="absolute rounded-full inset-y-0 bg-primary w-4px transition-colors left-6px group_scrolly-hover:w-6px group_scrolly-hover:left-5px"
            :class="{ 'w-6px left-5px': status.isDragInProgress }"
          />
        </div>
      </NatDragAndDrop>
    </div>
  </div>
</template>
