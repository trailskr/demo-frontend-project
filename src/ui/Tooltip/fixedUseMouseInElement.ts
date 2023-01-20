import { unrefElement, MaybeElementRef } from '@vueuse/core'
import { ref, watch } from 'vue'

import { useGlobalMouse } from '@/use/useGlobalMouse'
import { noop } from '@/utils/utils'

// see https://github.com/vueuse/vueuse/issues/1614
// added additonal check that element is on top of the view
// and used global mouse positions
export const fixedUseMouseInElement = (
  targetRef: MaybeElementRef
) => {
  const { x, y, lastComposedPath } = useGlobalMouse()

  const isOutside = ref(true)

  let stop = noop

  if (window) {
    stop = watch(
      [targetRef, x, y],
      () => {
        const el = unrefElement(targetRef)
        if (!el) return

        // check that element on top of the view
        if (!lastComposedPath.value.includes(el)) {
          isOutside.value = true
          return
        }

        const { left, top, width, height } = el.getBoundingClientRect()

        const elementPositionX = left + window.pageXOffset
        const elementPositionY = top + window.pageYOffset

        const elX = x.value - elementPositionX
        const elY = y.value - elementPositionY
        isOutside.value =
          width === 0 ||
          height === 0 ||
          elX < 0 ||
          elY < 0 ||
          elX > width ||
          elY > height
      },
      { immediate: true }
    )
  }

  return {
    x,
    y,
    isOutside,
    stop
  }
}
