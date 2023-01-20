import { MaybeRef } from '@vueuse/core'
import { Ref } from 'vue'

import { Error } from '@/api/apiTypes'
import { isResponseWithData, ResponseWithData } from '@/utils/createApi'
import { isObject } from '@/utils/typecheck'

export const isError = (err: unknown): err is Error => {
  return isObject(err) && 'message' in err
}

export const isApiResponseError = (err: unknown): err is ResponseWithData<Error> => {
  const v = toRaw(err)
  return isResponseWithData(v) && isError(v.data)
}

export const useErrorMapper = (err: Readonly<Ref<unknown>>, resetMutation?: MaybeRef<() => void>) => {
  const { t } = useI18n()

  const innerErr = ref<string>()
  watchEffect(() => {
    const v = err.value
    if (!v) {
      innerErr.value = undefined
      return
    }
    innerErr.value = isApiResponseError(v)
      ? v.data.message
      : isError(v)
        ? innerErr.value = v.message
        : t('errors.an-error-has-occured')

    console.error(`SERVER ERROR:\n${JSON.stringify(isApiResponseError(v) ? v.data : v, null, '  ')}`)
  })
  const reset = () => {
    if (resetMutation) unref(resetMutation)()
    innerErr.value = undefined
  }
  return [innerErr, reset] as const
}
