<script setup lang="ts">
  import { Placement, createPopper, Instance, Modifier } from '@popperjs/core'
  import { MaybeElement } from '@vueuse/core'
  import maxSize from 'popper-max-size-modifier'
  import { WatchStopHandle } from 'vue'

  import { onClickOutsideFixed } from '@/use/onClickOutsideFixed'
  import { useLocalVModel } from '@/use/useLocalVModel'

  import { addPopoverChildElement } from '../use/usePopovers'

  import { getPopoverId } from './popover'

  interface Props {
    modelValue?: boolean
    referenceRef?: MaybeElement
    contentRef?: (el: HTMLElement | undefined) => void
    applyMaxSize?: boolean
    applySameWidth?: boolean
    offset?: [x: number, y: number]
    withOffset?: number
    contentClass?: string
    showArrow?: boolean
    placement?: Placement
  }

  const props = withDefaults(defineProps<Props>(), {
    offset: () => [0, 8],
    withOffset: 0,
    contentClass: 'bg-white',
    placement: 'auto'
  })

  interface Emits {
    (e: 'update:modelValue', modelValue: Props['modelValue']): void
  }

  const emit = defineEmits<Emits>()

  const popoverId = getPopoverId()

  const isVisible = useLocalVModel(props, 'modelValue', emit, { defaultValue: false })

  const reference = ref<MaybeElement>()
  const referenceRef: (el: any) => void = (el: MaybeElement) => {
    reference.value = el
  }
  watchEffect(() => {
    if (props.referenceRef) {
      reference.value = props.referenceRef
    }
  })

  const content = ref<HTMLElement | undefined>()
  watch(content, (el) => {
    if (props.contentRef) props.contentRef(el)
  })

  let isOpen = false // open state
  const isAnimationInProgress = ref(false) // should turned on - first, off - last
  const animationTrigger = ref(false) // should turned on - last, off - first
  let popper: Instance | undefined

  let interuptableTimeout: number | undefined
  const crossInterruptible = <TArgs extends unknown[]>(func: (...args: TArgs) => void): (...args: TArgs) => void => {
    return (...args: TArgs): void => {
      const later = () => {
        interuptableTimeout = undefined
        func(...args)
      }
      clearTimeout(interuptableTimeout)
      interuptableTimeout = window.setTimeout(later)
    }
  }

  const close = crossInterruptible((shouldEmit = true) => {
    if (!isOpen) return
    if (shouldEmit) isVisible.value = false
    isOpen = false
    animationTrigger.value = false
  })

  const onAnimationFinish = () => {
    if (!isAnimationInProgress.value) return
    isAnimationInProgress.value = false
    if (!popper) return
    popper.destroy()
    popper = undefined
  }

  const children = addPopoverChildElement(content)
  const ignore = computed(() => [reference, ...children.value])
  onClickOutsideFixed(content, (e) => { close() }, { ignore })

  let unwatch: WatchStopHandle | undefined

  const open = crossInterruptible((shouldEmit = true) => {
    if (isOpen) return
    isOpen = true
    if (shouldEmit) isVisible.value = true
    isAnimationInProgress.value = true

    if (unwatch) unwatch()

    unwatch = watchEffect(() => {
      const referenceEl = unrefElement(reference)
      const contentEl = content.value
      if (!referenceEl || !contentEl) return

      const modifiers: Partial<Modifier<string, any>>[] = [{
        name: 'offset',
        options: {
          offset: props.offset
        }
      }, {
        name: 'flip'
      }]

      if (props.applyMaxSize) {
        modifiers.push(maxSize, {
          name: 'applyMaxSize',
          enabled: true,
          phase: 'beforeWrite',
          requires: ['maxSize'],
          fn: ({ state }) => {
            const { height } = state.modifiersData.maxSize
            state.styles.popper.maxHeight = `${height}px`
            state.styles.popper.overflowY = 'auto'
            state.styles.popper.overscrollBehavior = 'none'
          }
        })
      }

      if (props.applySameWidth) {
        modifiers.push({
          name: 'sameWidth',
          enabled: true,
          phase: 'beforeWrite',
          requires: ['computeStyles'],
          fn: ({ state }) => {
            state.styles.popper.minWidth = `${state.rects.reference.width + props.withOffset}px`
          },
          effect: ({ state }) => {
            state.elements.popper.style.minWidth = `${
              (state.elements.reference as HTMLElement).offsetWidth + props.withOffset
            }px`
          }
        })
      }

      popper = createPopper(referenceEl, contentEl, {
        placement: props.placement,
        modifiers
      })

      animationTrigger.value = true
      nextTick(() => {
        if (unwatch) unwatch()
      })
    })
  })

  watch(isVisible, (value) => {
    if (value) open(false)
    else close(false)
  }, { immediate: true })

  const toggle = () => {
    if (isOpen) close()
    else open()
  }

  onBeforeUnmount(close)
</script>

<script lang="ts">
  export default defineComponent({
    inheritAttrs: false
  })
</script>

<template>
  <slot
    :ref="referenceRef"
    :popoverId="popoverId"
    :open="open"
    :close="close"
    :toggle="toggle"
    name="reference"
  />
  <Teleport
    v-if="isAnimationInProgress"
    to="body"
  >
    <Transition
      enterActiveClass="transition-opacity"
      enterFromClass="opacity-0"
      enterToClass="opacity-100"
      leaveActiveClass="transition-opacity"
      leaveFromClass="opacity-100"
      leaveToClass="opacity-0"
      @afterLeave="onAnimationFinish"
    >
      <div
        v-show="animationTrigger"
        v-bind="$attrs"
        :id="popoverId"
        ref="content"
        class="rounded-5px shadow-popover popover z-1"
        :class="contentClass"
      >
        <slot
          :open="open"
          :close="close"
          :toggle="toggle"
        />
        <div
          v-if="showArrow"
          data-popper-arrow
          class="w-2 h-2 absolute bg-inherit invisible arrow"
        >
          <div class="w-2 h-2 absolute bg-inherit visible rotate-45" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .popover[data-popper-placement^='top'] > .arrow {
    bottom: -4px;
  }

  .popover[data-popper-placement^='bottom'] > .arrow {
    top: -4px;
  }

  .popover[data-popper-placement^='left'] > .arrow {
    right: -4px;
  }

  .popover[data-popper-placement^='right'] > .arrow {
    left: -4px;
  }
</style>
