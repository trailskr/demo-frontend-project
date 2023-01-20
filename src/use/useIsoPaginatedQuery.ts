import type { QueryKey } from 'react-query/types/core'
import { Ref, UnwrapNestedRefs } from 'vue'
import { UseQueryOptions, UseQueryReturnType } from 'vue-query'

import { PagedList } from '@/api/apiTypes'
import { Pager } from '@/ui/Pagination/Pager'

import { IsoQueryFnParams, useIsoQuery } from './useIsoQuery'

export interface PagedQueryParams {
  skip?: number | null
  limit?: number | null
}

export type PagedQueryFnData<T, K extends string> = PagedList & {[key in K]: T[]}

export type UseIsoPaginatedQueryOptions<TListItem, PageQueryDataKey extends string, TQueryFnData extends PagedQueryFnData<TListItem, PageQueryDataKey> = PagedQueryFnData<TListItem, PageQueryDataKey>, TError = unknown, TData extends PagedQueryFnData<TListItem, PageQueryDataKey> = TQueryFnData, TQueryKey extends QueryKey = QueryKey> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'> & { infinite?: boolean }

export type PagedQueryFunction<TListItem, PageQueryDataKey extends string, TQueryFnData extends PagedQueryFnData<TListItem, PageQueryDataKey>, TQueryParams extends PagedQueryParams> = (params: TQueryParams) => TQueryFnData | Promise<TQueryFnData>

export type PaginatedIsoQueryFnParams<TQueryParams> = IsoQueryFnParams<Omit<TQueryParams, 'skip' | 'limit'>>

export type UseIsoPaginatedQueryReturnType<TListItem, PageQueryDataKey extends string, TData extends PagedQueryFnData<TListItem, PageQueryDataKey>, TError> = UseQueryReturnType<TData, TError> & { page: Readonly<Ref<TListItem[]>>, isFullyLoaded: Readonly<Ref<boolean>> }

export const useIsoPaginatedQuery = <TListItem, PageQueryDataKey extends string, TQueryFnData extends PagedQueryFnData<TListItem, PageQueryDataKey>, TQueryParams extends PagedQueryParams, TError = unknown, TData extends PagedQueryFnData<TListItem, PageQueryDataKey> = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  queryKey: QueryKey,
  listKey: PageQueryDataKey,
  queryFn: PagedQueryFunction<TListItem, PageQueryDataKey, TQueryFnData, TQueryParams>,
  params: PaginatedIsoQueryFnParams<TQueryParams>,
  pg?: UnwrapNestedRefs<Pager>,
  options?: UseIsoPaginatedQueryOptions<TListItem, PageQueryDataKey, TQueryFnData, TError, TData, TQueryKey>): UseIsoPaginatedQueryReturnType<TListItem, PageQueryDataKey, TData, TError> => {
  const pagedParams = reactive({
    ...params,
    skip: computed(() => pg?.offset ?? 1),
    limit: computed(() => pg?.limit ?? 10000)
  }) as TQueryParams

  const result = useIsoQuery<TQueryFnData, TQueryParams, TError, TData, TQueryKey>(queryKey, queryFn, pagedParams, { keepPreviousData: true, ...options })

  watchEffect(() => {
    const total = result.data.value?.total
    if (pg && total != null) pg.update({ total })
  })

  if (options?.infinite) {
    const page = ref<TListItem[]>([])

    let lastSkip = pagedParams.skip
    let lastCount = pagedParams.limit
    watch(result.data, (data: undefined | TData) => {
      if (!data) return
      if (lastSkip != null && lastCount != null && lastCount === data.limit && lastSkip === data.skip - 1) {
        page.value = [...page.value, ...data[listKey] as UnwrapNestedRefs<TListItem[]>]
      } else {
        page.value = data[listKey] as UnwrapNestedRefs<TListItem[]>
      }
      lastSkip = data.skip
      lastCount = data.limit
    }, { immediate: true })

    return { ...result, page: page as Readonly<Ref<TListItem[]>>, isFullyLoaded: computed(() => pg ? page.value.length === pg.total : false) }
  } else {
    const page = computed(() => result.data.value?.[listKey] ?? [])
    return { ...result, page, isFullyLoaded: computed(() => pg ? page.value.length === pg.total : false) }
  }
}
