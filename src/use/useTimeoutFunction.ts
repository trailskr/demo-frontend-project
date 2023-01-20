import { MaybeRef, UseTimeoutFnOptions, Stoppable, isClient } from '@vueuse/core'

export const useTimeoutFunction = (
  cb: (next: () => void) => void,
  interval: MaybeRef<number>,
  options: UseTimeoutFnOptions = {}
): Stoppable => {
  const {
    immediate = false
  } = options

  const isPending = ref(false)

  let timer: number | null = null

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const stop = () => {
    isPending.value = false
    clear()
  }

  const next = () => {
    timer = setTimeout(() => {
      timer = null
      cb(next)
    }, unref(interval)) as unknown as number
  }

  const start = () => {
    clear()
    isPending.value = true
    next()
  }

  if (immediate) {
    isPending.value = true
    if (isClient) { start() }
  }

  tryOnScopeDispose(stop)

  return {
    isPending,
    start,
    stop
  }
}
