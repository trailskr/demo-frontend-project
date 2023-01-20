import type { MutationFunction, QueryKey } from 'react-query/types/core'
import { useQueryClient, useMutation, UseMutationOptions, UseMutationReturnType } from 'vue-query'

import { CallerOptions } from '@/utils/createApi'
import { isFunction } from '@/utils/typecheck'

export type EditMutationFunctions<TResData, TReqData extends { id: number | string }> = {
  create: (data: TReqData, options?: CallerOptions | undefined) => Promise<TResData>
  update: ({ id }: { id: TReqData['id'] }, data: TReqData, options?: CallerOptions | undefined) => Promise<TResData>
} | ((data: TReqData, options?: CallerOptions | undefined) => Promise<TResData>)

export type UseEditMutationOptions<TResData, TReqData, TError = unknown, TContext = unknown> = Omit<UseMutationOptions<TResData, TError, TReqData, TContext>, 'mutationKey' | 'mutationFn'>

export const useEditMutation = <TResData, TReqData extends { id: number | string }, TError = unknown, TContext = unknown>(
  invalidateQueryKey: QueryKey,
  queryKeyFn: ((data: TResData, variables: TReqData, context: TContext | undefined) => QueryKey) | null,
  mutationFns: EditMutationFunctions<TResData, TReqData>,
  options?: UseEditMutationOptions<TResData, TReqData, TError, TContext>
): UseMutationReturnType<TResData, TError, TReqData, TContext> => {
  const queryClient = useQueryClient()

  const mutationFunction: MutationFunction<TResData, TReqData> = (reqData) => {
    const id = reqData.id
    if (isFunction(mutationFns)) return mutationFns(reqData)
    const { update, create } = mutationFns
    return id ? update({ id }, reqData) : create(reqData)
  }

  const mutationOptions = {
    ...options,
    onSuccess: (data: TResData, variables: TReqData, context: TContext | undefined) => {
      queryClient.invalidateQueries(invalidateQueryKey)
      if (queryKeyFn) queryClient.setQueriesData(queryKeyFn(data, variables, context), data)
      options?.onSuccess?.(data, variables, context)
    }
  }

  return useMutation<TResData, TError, TReqData, TContext>(mutationFunction, mutationOptions)
}

export type EditSignletonMutationFunction<TResData, TReqData> = ((data: TReqData, options?: CallerOptions | undefined) => Promise<TResData>)

export const useEditSingletonMutation = <TResData, TReqData, TError = unknown, TContext = unknown>(
  invalidateQueryKey: QueryKey,
  queryKeyFn: ((data: TResData, variables: TReqData, context: TContext | undefined) => QueryKey) | null,
  mutationFunction: EditSignletonMutationFunction<TResData, TReqData>,
  options?: UseEditMutationOptions<TResData, TReqData, TError, TContext>
): UseMutationReturnType<TResData, TError, TReqData, TContext> => {
  const queryClient = useQueryClient()

  const mutationOptions = {
    ...options,
    onSuccess: (data: TResData, variables: TReqData, context: TContext | undefined) => {
      queryClient.invalidateQueries(invalidateQueryKey)
      if (queryKeyFn) queryClient.setQueriesData(queryKeyFn(data, variables, context), data)
      options?.onSuccess?.(data, variables, context)
    }
  }

  return useMutation<TResData, TError, TReqData, TContext>(mutationFunction, mutationOptions)
}
