import { MaybeRef } from '@vueuse/core'
import { Ref } from 'vue'

export const useDisableHtmlScroll = (isDisabled?: MaybeRef<boolean>): Ref<boolean> => {
  const isDisabledRef = isRef(isDisabled) ? isDisabled : ref(isDisabled ?? false)
  useHead(computed(() => ({
    htmlAttrs: { class: isDisabledRef.value ? 'overflow-hidden' : '' }
  })))
  return isDisabledRef
}
