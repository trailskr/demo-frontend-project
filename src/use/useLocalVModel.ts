import { isDef } from '@vueuse/core'
import { UnwrapRef } from 'vue'

export interface UseLocalVModelOptions<T> {
  deep?: boolean
  eventName?: string
  defaultValue?: T
}

/**
 * Makes local copy of modelValue
 *
 * @param props
 * @param key
 * @param emit
 */
export const useLocalVModel = <P extends object, K extends keyof P, EventName extends string>(
  props: P,
  key: K,
  emit: (name: EventName, ...args: any[]) => void,
  options: UseLocalVModelOptions<P[K]> = {}
) => {
  const { deep = false, eventName, defaultValue } = options

  const event = eventName || `update:${String(key)}`

  const getValue = () => isDef(props[key]) ? props[key] : defaultValue

  const proxy = ref<P[K]>(getValue()!)

  watch(() => props[key], (v) => {
    proxy.value = v as UnwrapRef<P[K]>
  })

  watch(proxy, (v) => {
    if (v !== props[key] || deep) {
      emit(event as EventName, v)
    }
  }, { deep })

  return proxy
}
