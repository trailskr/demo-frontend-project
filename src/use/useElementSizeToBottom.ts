import { MaybeElementRef } from '@vueuse/core'

export const useElementSizeToBottom = (elRef: MaybeElementRef<HTMLElement | undefined>) => {
  const { height } = useWindowSize()
  watchEffect(() => {
    const el = unrefElement(elRef)
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.height = `${height.value - rect.top}px`
  })
}
