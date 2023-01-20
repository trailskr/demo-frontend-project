import { MaybeElementRef } from '@vueuse/core'

const waitElementVisible = (elRef: MaybeElementRef, fn: () => void, calledTimes = 1) => {
  const el = unrefElement(elRef)
  if (el && el.clientHeight !== 0 && el.clientWidth !== 0) {
    fn()
    return
  }
  if (calledTimes > 5) {
    console.error('element is not visuble for too long')
    return
  }
  setTimeout(() => {
    waitElementVisible(elRef, fn, calledTimes + 1)
  })
}

export const onVisible = (elRef: MaybeElementRef, fn: () => void) => {
  onMounted(() => {
    waitElementVisible(elRef, fn)
  })
}
