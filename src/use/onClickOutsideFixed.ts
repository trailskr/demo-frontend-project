/* eslint-disable @typescript-eslint/no-shadow */
import { ConfigurableWindow, MaybeElementRef } from '@vueuse/core'
import { MaybeRef } from 'vue-query/lib/vue/types'

const defaultWindow = window

export interface OnClickOutsideOptions extends ConfigurableWindow {
  /**
   * List of elements that should not trigger the event.
   */
  ignore?: MaybeRef<MaybeElementRef[]>
  /**
   * Use capturing phase for internal event listener.
   * @default true
   */
  capture?: boolean
}

/**
 * Listen for clicks outside of an element.
 *
 * @see https://vueuse.org/onClickOutside
 * @param target
 * @param handler
 * @param options
 */
export const onClickOutsideFixed = (
  target: MaybeElementRef,
  handler: (evt: PointerEvent) => void,
  options: OnClickOutsideOptions = {}
) => {
  const { window = defaultWindow, ignore, capture = true } = options

  if (!window) { return }

  const shouldListen = ref(true)

  let fallback: number

  const listener = (event: PointerEvent, path?: EventTarget[]) => {
    window.clearTimeout(fallback)

    const el = unrefElement(target)
    const composedPath = path || event.composedPath()

    if (!el || el === event.target || composedPath.includes(el) || !shouldListen.value) { return }

    const ignoreList = unref(ignore)
    if (ignoreList && ignoreList.length > 0) {
      if (ignoreList.some((target) => {
        const el = unrefElement(target)
        return el && (event.target === el || composedPath.includes(el))
      })) { return }
    }

    handler(event)
  }

  const cleanup = [
    useEventListener(window, 'click', listener, { passive: true, capture }),
    useEventListener(window, 'pointerdown', (e) => {
      const el = unrefElement(target)
      shouldListen.value = !!el && !e.composedPath().includes(el)
    }, { passive: true }),
    useEventListener(window, 'pointerup', (e) => {
      const composedPath = e.composedPath()
      fallback = window.setTimeout(() => listener(e, composedPath), 50)
    }, { passive: true })
  ]

  const stop = () => cleanup.forEach((fn) => fn())

  return stop
}
