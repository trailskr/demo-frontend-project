<script setup lang="ts">
  import { Placement } from '@popperjs/core'
  import { MaybeElement } from '@vueuse/core'

  import { debounce, addEventListener, noop } from '@/utils/utils'

  import { fixedUseMouseInElement } from './fixedUseMouseInElement'

  interface Props {
    placement?: Placement
    referenceRef?: MaybeElement
    manual?: boolean
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    placement: 'top'
  })

  const reference = ref<MaybeElement>()
  const tooltipReferenceRef: (el: any) => void = (el: MaybeElement) => {
    reference.value = el
  }
  watchEffect(() => {
    if (props.referenceRef) {
      reference.value = props.referenceRef
    }
  })

  const { isOutside } = fixedUseMouseInElement(reference)
  const isOutsideDebounced = useDebounce(isOutside, 300)
  const isVisible = ref(false)
  const model = computed({
    get: () => {
      return props.manual ? isVisible.value : !isOutsideDebounced.value
    },
    set: (v: boolean) => {
      isVisible.value = v
    }
  })

  let innerOpenDebounced: () => void = noop
  let innerOpenClearDebounce: () => void = noop
  const saveOpen = (openParam: () => void) => {
    const [debuncedOpen, clearDebouncedOpen] = debounce(openParam, 300)
    innerOpenDebounced = debuncedOpen
    innerOpenClearDebounce = clearDebouncedOpen
    return openParam
  }

  let innerClose: () => void | undefined
  const saveClose = (closeParam: () => void) => {
    innerClose = closeParam
    return closeParam
  }

  let stopTouchEnd = noop
  const stopTouchEndListen = () => {
    stopTouchEnd()
    stopTouchEnd = noop
  }
  const documentTouchEnd = () => {
    if (props.manual) return
    innerOpenClearDebounce()
    innerClose()
    stopTouchEndListen()
  }

  const touchStart = () => {
    if (props.manual) return
    innerOpenDebounced()
    stopTouchEndListen()
    stopTouchEnd = addEventListener(window, 'touchend', documentTouchEnd)
  }

  onBeforeUnmount(stopTouchEnd)

  const referenceEl = computed(() => unrefElement(reference))
  useEventListener(referenceEl, 'touchstart', touchStart)
</script>

<template>
  <slot
    v-if="disabled"
    :ref="tooltipReferenceRef"
    name="reference"
    :open="noop"
    :close="noop"
    :toggle="noop"
  />
  <NatPopover
    v-else
    :modelValue="model"
    :referenceRef="reference"
    :placement="placement"
    showArrow
    contentClass="bg-primary text-white p-2.5"
  >
    <template #reference="{ open, close, toggle, popoverId }">
      <slot
        :ref="tooltipReferenceRef"
        :popoverId="popoverId"
        name="reference"
        :open="saveOpen(open)"
        :close="saveClose(close)"
        :toggle="toggle"
      />
    </template>
    <template #default>
      <slot />
    </template>
  </NatPopover>
</template>
