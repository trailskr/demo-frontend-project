import { useDebouncedSearch } from './useDebouncedSearch'
import { IsoQueryFnParams } from './useIsoQuery'

export interface QueryParamsOption {
  useDebounce: boolean
}

export const useIsoQueryParams = <TQueryParams>(params: IsoQueryFnParams<TQueryParams>, options: Partial<Record<keyof TQueryParams, QueryParamsOption>> = {}): IsoQueryFnParams<TQueryParams> => {
  const modifiedParams = {} as any
  Object.keys(params).forEach((k) => {
    const key = k as keyof TQueryParams
    const option = options[key]
    modifiedParams[key] = params[key]
    if (option && option.useDebounce) {
      modifiedParams[key] = useDebouncedSearch(modifiedParams[key])
    }
  })
  return modifiedParams
}
