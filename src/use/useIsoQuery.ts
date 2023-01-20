import { MaybeRef } from '@vueuse/core'
import type { QueryKey } from 'react-query/types/core'
import { useQuery, UseQueryOptions, UseQueryReturnType } from 'vue-query'

import { CallerOptions } from '@/utils/createApi'
import { isArray } from '@/utils/typecheck'

export type UseIsoQueryOptions<TQueryFnData, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>

export type IsoQueryFunction<TQueryFnData, TQueryParams> = (params: TQueryParams, options?: CallerOptions | undefined) => TQueryFnData | Promise<TQueryFnData>

export type ToMayBeRefs<T = any> = {
    [K in keyof T]: MaybeRef<T[K]>
}

export type IsoQueryFnParams<TQueryParams> = ToMayBeRefs<TQueryParams>

export const useIsoQuery = <TQueryFnData, TQueryParams, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  queryKey: QueryKey,
  queryFn: IsoQueryFunction<TQueryFnData, TQueryParams>,
  params: IsoQueryFnParams<TQueryParams>,
  options?: UseIsoQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryReturnType<TData, TError> => {
  const reactiveParams = reactive(params) as TQueryParams
  const keys = [...(isArray(queryKey) ? queryKey : [queryKey]), reactiveParams] as unknown as TQueryKey
  const isoQueryFn = (callerOptions: CallerOptions) => queryFn(reactiveParams, callerOptions)
  const result = useQuery<TQueryFnData, TError, TData, TQueryKey>(keys, isoQueryFn, {
    refetchOnWindowFocus: !import.meta.env.DEV,
    retry: import.meta.env.DEV ? false : 3,
    ...options
  })

  if (import.meta.env.SSR) {
    onServerPrefetch(result.suspense)
  }

  return result
}
