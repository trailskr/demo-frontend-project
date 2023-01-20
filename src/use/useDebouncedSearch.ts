import { MaybeRef } from '@vueuse/core'
import { Ref } from 'vue'

export const useDebouncedSearch = (param: MaybeRef<string | undefined>): Readonly<Ref<string | undefined>> => {
  const paramDebounced = isRef(param) ? useDebounce(param) : undefined
  return computed(() => paramDebounced?.value || undefined)
}
