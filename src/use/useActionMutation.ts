import type { MutationFunction, QueryKey } from 'react-query/types/core'
import { useQueryClient, useMutation, UseMutationOptions, UseMutationReturnType } from 'vue-query'

import { CallerOptions } from '@/utils/createApi'

export type ActionMutationFunction<TResData, TReqData> = (variables: TReqData, options?: CallerOptions | undefined) => Promise<TResData>

export type ActionMutationVariables = {id: number}

export type UseActionMutationOptions<TReqData extends ActionMutationVariables = ActionMutationVariables, TResData = void, TError = unknown, TContext = unknown> = Omit<UseMutationOptions<TResData, TError, TReqData, TContext>, 'mutationKey' | 'mutationFn'>

export type UseActionMutationResult<TResData, TError, TReqData, TContext> = UseMutationReturnType<TResData, TError, TReqData, TContext>

export const useActionMutation = <TResData, TReqData extends ActionMutationVariables = ActionMutationVariables, TError = unknown, TContext = unknown>(
  invalidateKey: QueryKey,
  mutationFn: ActionMutationFunction<TResData, TReqData>,
  options?: UseActionMutationOptions<TReqData, TResData, TError, TContext>
): UseActionMutationResult<TResData, TError, TReqData, TContext> => {
  const queryClient = useQueryClient()

  const mutationFunction: MutationFunction<TResData, TReqData> = (params) => {
    return params.id ? mutationFn(params) : Promise.resolve() as unknown as Promise<TResData>
  }

  const mutationOptions = {
    ...options,
    onSuccess: (data: TResData, variables: TReqData, context: TContext | undefined) => {
      queryClient.invalidateQueries(invalidateKey)
      options?.onSuccess?.(data, variables, context)
    }
  }

  return useMutation<TResData, TError, TReqData, TContext>(mutationFunction, mutationOptions)
}
