import { MaybeRef } from '@vueuse/core'
import type { QueryKey } from 'react-query/types/core'
import { UseQueryReturnType } from 'vue-query'

import { IsoQueryFnParams, IsoQueryFunction, useIsoQuery, UseIsoQueryOptions } from './useIsoQuery'

export type IsoOptionalQueryFnParams<TQueryParams> = IsoQueryFnParams<TQueryParams>

export type UseIsoOptionalQueryOptions<TQueryFnData, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey> = UseIsoQueryOptions<TQueryFnData, TError, TData, TQueryKey>

export const useIsoOptionalQuery = <TQueryFnData, TQueryParams, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  queryKey: QueryKey,
  queryFn: IsoQueryFunction<TQueryFnData, TQueryParams>,
  params: IsoOptionalQueryFnParams<TQueryParams>,
  data?: MaybeRef<TQueryFnData>,
  options?: UseIsoQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryReturnType<TData, TError> => {
  const optionalQueryFn: IsoQueryFunction<TQueryFnData, TQueryParams> = (parameters, callerOptions) => {
    const unrefedData = unref(data)
    if (unrefedData != null) return unrefedData
    return queryFn(parameters, callerOptions)
  }
  return useIsoQuery<TQueryFnData, TQueryParams, TError, TData, TQueryKey>(queryKey, optionalQueryFn, params, options)
}
